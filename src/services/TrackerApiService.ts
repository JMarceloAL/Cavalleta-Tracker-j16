import type { TrackerLocation } from '../types/Tracker';

const API_URL = (
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.API_URL ??
    'https://mybombs.ddns.net:3000'
).replace(/\/$/, '');
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

/**
 * Garante 16 dígitos, preenchendo com zero à esquerda se necessário.
 * IMEIs podem começar com 0 e esse dígito é perdido se o valor
 * passar por alguma conversão numérica em algum ponto do app.
 */
function normalizeImei(imei: string): string {
    const digits = imei.replace(/\D/g, '');
    return digits.padStart(16, '0');
}

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
    return apiFetch(`/tracker/${normalizeImei(imei)}`);
}

/** Busca a localização atual via API e já converte pro formato usado no app */
export async function fetchTrackerLocationFromApi(imei: string): Promise<TrackerLocation> {
    const data = await apiFetch(`/location/${normalizeImei(imei)}`);
    const payload = data?.location ?? data;

    if (typeof payload?.latitude !== 'number' || typeof payload?.longitude !== 'number') {
        throw new Error(`Resposta inválida da API para localização do rastreador ${imei}.`);
    }

    return {
        latitude: payload.latitude,
        longitude: payload.longitude,
        speed: typeof payload.velocidade === 'number' ? payload.velocidade : payload.speed,
        satellites: payload.satelites,
        lastUpdate: payload.dataUTC ?? payload.data ?? payload.lastSeen ?? new Date().toISOString(),
    };
}

/**
 * Verifica se o rastreador está realmente online no servidor agora.
 *
 * A API nem sempre expõe `online: true` de forma consistente; em alguns
 * casos o rastreador retorna dados válidos de GPS/heartbeat/lastSeen mesmo
 * quando o campo `online` está ausente ou desatualizado.
 */
export async function checkTrackerOnline(imei: string, timeoutMs = 6000): Promise<boolean> {
    const normalizedImei = normalizeImei(imei);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${API_URL}/api/tracker/${normalizedImei}`, {
            headers: { 'x-api-key': API_KEY as string },
            signal: controller.signal,
        });

        if (!response.ok) return false;

        const data: Partial<ApiTracker> = await response.json();
        const onlineValue = data.online as unknown;

        if (typeof onlineValue === 'string') {
            const normalized = onlineValue.toLowerCase();
            if (normalized === 'true' || normalized === 'online') return true;
            if (normalized === 'false' || normalized === 'offline') return false;
        }

        if (data.online === true) return true;
        if (data.lastSeen) return true;
        if (data.gps) return true;
        if (data.heartbeat) return true;

        return false;
    } catch (error) {
        // rede caiu, timeout, servidor fora do ar etc. — trata como offline
        return false;
    } finally {
        clearTimeout(timeout);
    }
}

export type RealtimeAvailability =
    | { status: 'no-connection' }
    | { status: 'no-location' }
    | { status: 'available'; location: TrackerLocation };

/**
 * Checagem única usada pelo botão de tempo real. Diferente do
 * checkTrackerOnline (que só confirma presença no servidor), aqui a
 * exigência é mais estrita: só libera o tempo real se houver uma
 * localização GPS válida (lat/lng numéricos) disponível agora.
 *
 * - Não deu pra falar com o servidor (rede/timeout/erro HTTP) -> 'no-connection'
 * - Servidor respondeu, mas sem gps ou com lat/lng inválidos  -> 'no-location'
 * - Servidor respondeu com localização válida                -> 'available' + location
 */
export async function checkRealtimeAvailability(
    imei: string,
    timeoutMs = 6000
): Promise<RealtimeAvailability> {
    const normalizedImei = normalizeImei(imei);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${API_URL}/api/tracker/${normalizedImei}`, {
            headers: { 'x-api-key': API_KEY as string },
            signal: controller.signal,
        });

        if (!response.ok) {
            return { status: 'no-connection' };
        }

        const data: Partial<ApiTracker> = await response.json();
        const gps = data.gps;

        if (
            !gps ||
            typeof gps.latitude !== 'number' ||
            typeof gps.longitude !== 'number' ||
            !Number.isFinite(gps.latitude) ||
            !Number.isFinite(gps.longitude)
        ) {
            return { status: 'no-location' };
        }

        return {
            status: 'available',
            location: {
                latitude: gps.latitude,
                longitude: gps.longitude,
                speed: gps.velocidade,
                satellites: gps.satelites,
                lastUpdate: gps.dataUTC ?? gps.data ?? data.lastSeen ?? new Date().toISOString(),
            },
        };
    } catch (error) {
        // rede caiu, timeout, servidor fora do ar etc.
        return { status: 'no-connection' };
    } finally {
        clearTimeout(timeout);
    }
}