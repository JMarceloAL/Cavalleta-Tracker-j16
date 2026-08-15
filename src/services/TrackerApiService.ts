import type { TrackerLocation } from '../types/Tracker';

const API_URL = 'http://mybombs.ddns.net:3000';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

async function apiFetch(path: string) {
    const response = await fetch(`${API_URL}/api${path}`, {
        headers: {
            'x-api-key': API_KEY as string,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const error: any = new Error(errorBody?.error ?? `Erro ${response.status} ao consultar a API`);
        error.status = response.status;
        throw error;
    }

    return response.json();
}

type ApiGps = {
    latitude: number;
    longitude: number;
    velocidade?: number;
    satelites?: number;
    curso?: number;
    gpsValido?: boolean;
    data?: string;
    dataUTC?: string;
};

type ApiTracker = {
    imei: string;
    online: boolean;
    lastSeen: string | null;
    gps: ApiGps | null;
    heartbeat: { status: number; serial: string } | null;
};

/** Lista todos os rastreadores conhecidos pelo servidor */
export async function fetchAllTrackers(): Promise<ApiTracker[]> {
    return apiFetch('/trackers');
}

/** Dados completos de um rastreador (gps + heartbeat + status) */
export async function fetchTrackerData(imei: string): Promise<ApiTracker> {
    return apiFetch(`/tracker/${imei}`);
}

/** Busca a localização atual via API e já converte pro formato usado no app */
export async function fetchTrackerLocationFromApi(imei: string): Promise<TrackerLocation> {
    const data = await apiFetch(`/location/${imei}`);

    return {
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.velocidade,
        satellites: data.satelites,
        lastUpdate: data.dataUTC ?? data.data ?? data.lastSeen,
    };
}

/**
 * Verifica se o rastreador está realmente online no servidor agora
 * (socket TCP aberto + reportando dados), com timeout curto pra não
 * travar a UI. Qualquer erro (rede, timeout, 404) é tratado como offline.
 */
export async function checkTrackerOnline(imei: string, timeoutMs = 6000): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${API_URL}/api/tracker/${imei}`, {
            headers: { 'x-api-key': API_KEY as string },
            signal: controller.signal,
        });

        if (!response.ok) return false;

        const data: ApiTracker = await response.json();
        return data.online === true;
    } catch (error) {
        // rede caiu, timeout, servidor fora do ar etc. — trata como offline
        return false;
    } finally {
        clearTimeout(timeout);
    }
}