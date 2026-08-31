// src/services/storage/RouteHistoryStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TrackerLocation } from '../../types/Tracker';

const STORAGE_KEY = '@cavalleta:route_history';

export interface TrackerRoute {
    id: string;
    trackerId: string;

    startTime: string;
    endTime: string;

    distanceKm: number;

    points: TrackerLocation[];
}

function calculateDistanceKm(
    point1: TrackerLocation,
    point2: TrackerLocation
): number {
    const R = 6371;

    const lat1 = (point1.latitude * Math.PI) / 180;
    const lat2 = (point2.latitude * Math.PI) / 180;

    const deltaLat =
        ((point2.latitude - point1.latitude) * Math.PI) / 180;

    const deltaLon =
        ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function calculateRouteDistanceKm(
    points: TrackerLocation[]
): number {
    if (points.length < 2) {
        return 0;
    }

    let total = 0;

    for (let i = 1; i < points.length; i++) {
        total += calculateDistanceKm(points[i - 1], points[i]);
    }

    return total;
}

export async function getRoutes(
    trackerId: string
): Promise<TrackerRoute[]> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return [];
        }

        const allRoutes: TrackerRoute[] = JSON.parse(stored);

        return allRoutes
            .filter(route => route.trackerId === trackerId)
            .sort(
                (a, b) =>
                    new Date(b.startTime).getTime() -
                    new Date(a.startTime).getTime()
            );
    } catch (error) {
        console.warn('Erro ao carregar rotas:', error);
        return [];
    }
}

export async function saveRoute(
    route: TrackerRoute
): Promise<void> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        const allRoutes: TrackerRoute[] = stored
            ? JSON.parse(stored)
            : [];

        allRoutes.unshift(route);

        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(allRoutes)
        );
    } catch (error) {
        console.warn('Erro ao salvar rota:', error);
    }
}

export async function deleteRoute(
    routeId: string
): Promise<void> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return;
        }

        const allRoutes: TrackerRoute[] = JSON.parse(stored);

        const filtered = allRoutes.filter(
            route => route.id !== routeId
        );

        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(filtered)
        );
    } catch (error) {
        console.warn('Erro ao excluir rota:', error);
    }
}

export async function clearTrackerRoutes(
    trackerId: string
): Promise<void> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return;
        }

        const allRoutes: TrackerRoute[] = JSON.parse(stored);

        const filtered = allRoutes.filter(
            route => route.trackerId !== trackerId
        );

        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(filtered)
        );
    } catch (error) {
        console.warn('Erro ao limpar rotas:', error);
    }
}

/**
 * Sobrescreve todas as rotas de um rastreador com os dados vindos
 * da API (sincronização servidor -> cache local).
 *
 * Remove as rotas antigas desse trackerId do cache e insere as
 * novas no lugar — as rotas de OUTROS rastreadores no mesmo
 * arquivo (STORAGE_KEY é compartilhado entre todos) não são
 * tocadas.
 */
export async function replaceTrackerRoutes(
    trackerId: string,
    routes: TrackerRoute[]
): Promise<void> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        const allRoutes: TrackerRoute[] = stored
            ? JSON.parse(stored)
            : [];

        const otherTrackersRoutes = allRoutes.filter(
            route => route.trackerId !== trackerId
        );

        const nextAllRoutes = [
            ...routes,
            ...otherTrackersRoutes,
        ];

        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(nextAllRoutes)
        );
    } catch (error) {
        console.warn('Erro ao sincronizar rotas:', error);
    }
}