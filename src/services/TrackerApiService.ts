// src/services/TrackerApiService.ts

import type { TrackerLocation } from '../types/Tracker';

const API_URL = (
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.API_URL ??
    'https://mybombs.ddns.net:3000'
).replace(/\/$/, '');

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

const DEFAULT_TIMEOUT_MS = 8000;

function normalizeImei(imei: string): string {
    const digits = String(imei).replace(/\D/g, '');

    return digits.padStart(16, '0');
}

/**
 * Faz a chamada à API sempre com timeout (AbortController).
 *
 * Sem isso, se o servidor cair de um jeito que não recuse a
 * conexão na hora (porta filtrada, processo travado etc.), o
 * fetch() fica pendurado indefinidamente — e qualquer polling
 * que dependa dele (como o Modo Vigilante) nunca detecta a
 * queda e nunca sai do estado de "carregando".
 */
async function apiFetch(
    path: string,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
) {
    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        timeoutMs
    );

    try {
        const response = await fetch(
            `${API_URL}/api${path}`,
            {
                headers: {
                    'x-api-key': API_KEY ?? '',
                    Accept: 'application/json',
                },
                signal: controller.signal,
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

        return await response.json();
    } catch (error: any) {
        if (error?.name === 'AbortError') {
            const timeoutError: any = new Error(
                `Tempo esgotado ao consultar a API (${timeoutMs}ms).`
            );

            timeoutError.code = 'TIMEOUT';

            throw timeoutError;
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
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

export type ApiMovement = {
    moving: boolean;
    alarmPending: boolean;
    routeId: string | null;
    lastMovementAt: string | null;
    lastAlarmAt: string | null;
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
    movement?: ApiMovement | null;
    routes?: ApiRouteSummary[];
    stoppedLocations?: ApiStoppedLocation[];
};

/**
 * ========================================================
 * HISTÓRICO — LOCALIZAÇÕES PARADAS
 * ========================================================
 */
export type ApiStoppedLocation = ApiGps & {
    id: string;
    imei: string;
    stoppedAt: string;
};

/**
 * ========================================================
 * HISTÓRICO — ROTAS
 * ========================================================
 *
 * O resumo (retornado por /tracker/:imei/routes) não traz os
 * pontos, só `totalPoints`. Pra ter a linha completa da rota
 * é preciso buscar o detalhe via fetchRouteDetail.
 */
export type ApiRoutePoint = ApiGps & {
    timestamp: string;
};

export type ApiRouteSummary = {
    id: string;
    imei: string;
    startedAt: string;
    finishedAt: string | null;
    startSource: string;
    startLocation: ApiGps | null;
    endLocation: ApiGps | null;
    distanceKm: number;
    maxSpeed: number;
    durationSeconds?: number;
    totalPoints: number;
};

export type ApiRouteDetail = Omit<ApiRouteSummary, 'totalPoints'> & {
    points: ApiRoutePoint[];
};

export async function fetchAllTrackers(): Promise<ApiTracker[]> {
    return apiFetch('/trackers');
}

export async function fetchTrackerData(
    imei: string,
    timeoutMs?: number
): Promise<ApiTracker> {
    return apiFetch(
        `/tracker/${normalizeImei(imei)}`,
        timeoutMs
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

/**
 * Busca as últimas localizações "paradas" registradas pelo
 * servidor para o IMEI informado (até 10, mais recente primeiro).
 */
export async function fetchStoppedLocations(
    imei: string
): Promise<ApiStoppedLocation[]> {
    const data = await apiFetch(
        `/tracker/${normalizeImei(imei)}/stopped-locations`
    );

    return Array.isArray(data?.locations) ? data.locations : [];
}

/**
 * Busca o resumo das últimas rotas (até 10, mais recente primeiro).
 * Não traz os pontos — use fetchRouteDetail para isso.
 */
export async function fetchRoutes(
    imei: string
): Promise<ApiRouteSummary[]> {
    const data = await apiFetch(
        `/tracker/${normalizeImei(imei)}/routes`
    );

    return Array.isArray(data?.routes) ? data.routes : [];
}

/**
 * Busca uma rota específica, com todos os pontos.
 */
export async function fetchRouteDetail(
    imei: string,
    routeId: string
): Promise<ApiRouteDetail> {
    return apiFetch(
        `/tracker/${normalizeImei(imei)}/routes/${routeId}`
    );
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