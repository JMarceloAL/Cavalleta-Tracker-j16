// src/services/TrackerApiService.ts

import type { TrackerLocation } from '../types/Tracker';

const API_URL = (
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.API_URL ??
    'https://mybombs.ddns.net:3000'
).replace(/\/$/, '');

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

function normalizeImei(imei: string): string {
    const digits = String(imei).replace(/\D/g, '');

    return digits.padStart(16, '0');
}

async function apiFetch(
    path: string,
    signal?: AbortSignal
) {
    const response = await fetch(
        `${API_URL}/api${path}`,
        {
            headers: {
                'x-api-key': API_KEY ?? '',
                Accept: 'application/json',
            },
            signal,
        }
    );

    if (!response.ok) {
        const errorBody = await response
            .json()
            .catch(() => null);

        const error: any = new Error(
            errorBody?.error ??
            `Erro ${response.status} ao consultar a API`
        );

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

export type ApiTracker = {
    imei: string;
    online: boolean;
    lastSeen: string | null;
    gps: ApiGps | null;
    heartbeat: {
        status: number;
        serial: string;
    } | null;
};

export async function fetchAllTrackers(): Promise<ApiTracker[]> {
    return apiFetch('/trackers');
}

export async function fetchTrackerData(
    imei: string
): Promise<ApiTracker> {
    return apiFetch(
        `/tracker/${normalizeImei(imei)}`
    );
}

export async function fetchTrackerLocationFromApi(
    imei: string
): Promise<TrackerLocation> {
    const data = await apiFetch(
        `/location/${normalizeImei(imei)}`
    );

    const payload = data?.location ?? data;

    if (
        typeof payload?.latitude !== 'number' ||
        typeof payload?.longitude !== 'number'
    ) {
        throw new Error(
            `Resposta inválida da API para localização do rastreador ${imei}.`
        );
    }

    return {
        latitude: payload.latitude,
        longitude: payload.longitude,

        speed:
            typeof payload.velocidade === 'number'
                ? payload.velocidade
                : payload.speed,

        satellites:
            typeof payload.satelites === 'number'
                ? payload.satelites
                : payload.satellites,

        lastUpdate:
            payload.dataUTC ??
            payload.data ??
            payload.lastSeen ??
            new Date().toISOString(),
    };
}

export async function checkTrackerOnline(
    imei: string,
    timeoutMs = 6000
): Promise<boolean> {
    const normalizedImei = normalizeImei(imei);

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        timeoutMs
    );

    try {
        const response = await fetch(
            `${API_URL}/api/tracker/${normalizedImei}`,
            {
                headers: {
                    'x-api-key': API_KEY ?? '',
                },
                signal: controller.signal,
            }
        );

        if (!response.ok) {
            return false;
        }

        const data: Partial<ApiTracker> =
            await response.json();

        if (data.online === true) {
            return true;
        }

        if (typeof data.online === 'string') {
            const value = (
                data.online as string
            ).toLowerCase();

            if (
                value === 'true' ||
                value === 'online'
            ) {
                return true;
            }

            if (
                value === 'false' ||
                value === 'offline'
            ) {
                return false;
            }
        }

        if (data.lastSeen) {
            return true;
        }

        if (data.gps) {
            return true;
        }

        if (data.heartbeat) {
            return true;
        }

        return false;
    } catch {
        return false;
    } finally {
        clearTimeout(timeout);
    }
}

export type RealtimeAvailability =
    | {
        status: 'no-connection';
    }
    | {
        status: 'no-location';
    }
    | {
        status: 'available';
        location: TrackerLocation;
    };

export async function checkRealtimeAvailability(
    imei: string,
    timeoutMs = 6000
): Promise<RealtimeAvailability> {
    const normalizedImei = normalizeImei(imei);

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        timeoutMs
    );

    try {
        const response = await fetch(
            `${API_URL}/api/tracker/${normalizedImei}`,
            {
                headers: {
                    'x-api-key': API_KEY ?? '',
                },
                signal: controller.signal,
            }
        );

        if (!response.ok) {
            return {
                status: 'no-connection',
            };
        }

        const data: Partial<ApiTracker> =
            await response.json();

        const gps = data.gps;

        if (
            !gps ||
            typeof gps.latitude !== 'number' ||
            typeof gps.longitude !== 'number' ||
            !Number.isFinite(gps.latitude) ||
            !Number.isFinite(gps.longitude)
        ) {
            return {
                status: 'no-location',
            };
        }

        return {
            status: 'available',

            location: {
                latitude: gps.latitude,
                longitude: gps.longitude,

                speed: gps.velocidade,

                satellites: gps.satelites,

                lastUpdate:
                    gps.dataUTC ??
                    gps.data ??
                    data.lastSeen ??
                    new Date().toISOString(),
            },
        };
    } catch {
        return {
            status: 'no-connection',
        };
    } finally {
        clearTimeout(timeout);
    }
}