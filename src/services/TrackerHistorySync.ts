// src/services/TrackerHistorySync.ts
//
// Ponte entre a API (fonte de verdade) e o cache local (AsyncStorage).
//
// syncTrackerHistory() busca localizações paradas e rotas do servidor
// para um IMEI, sobrescreve o cache local com esses dados, e devolve
// o resultado já pronto pra tela usar.

import {
    fetchStoppedLocations,
    fetchRoutes,
    fetchRouteDetail,
    type ApiStoppedLocation,
    type ApiRouteDetail,
} from './TrackerApiService';

import {
    replaceLocationHistory,
} from './storage/LastlocationStorage';

import {
    replaceTrackerRoutes,
    type TrackerRoute,
} from './storage/RouteHistoryStorage';

import type { TrackerLocation } from '../types/Tracker';

function toTrackerLocation(
    item: ApiStoppedLocation
): TrackerLocation {
    return {
        latitude: item.latitude,
        longitude: item.longitude,
        speed: item.velocidade,
        satellites: item.satelites,
        lastUpdate:
            item.dataUTC ??
            item.data ??
            item.stoppedAt,
    };
}

function toTrackerRoute(
    trackerId: string,
    detail: ApiRouteDetail
): TrackerRoute {
    return {
        id: detail.id,
        trackerId,

        startTime: detail.startedAt,

        // Rota ainda em andamento (finishedAt null) — usa o início
        // como fallback só pra não deixar o campo vazio; a tela de
        // histórico não deve normalmente mostrar rotas em aberto,
        // mas fica protegido caso apareça uma.
        endTime: detail.finishedAt ?? detail.startedAt,

        distanceKm: detail.distanceKm,

        points: detail.points.map(point => ({
            latitude: point.latitude,
            longitude: point.longitude,
            speed: point.velocidade,
            satellites: point.satelites,
            lastUpdate:
                point.dataUTC ??
                point.data ??
                point.timestamp,
        })),
    };
}

export type SyncResult = {
    locations: TrackerLocation[];
    routes: TrackerRoute[];
};

/**
 * Sincroniza localizações paradas e rotas de um rastreador com o
 * servidor, atualizando o cache local (AsyncStorage) no processo.
 *
 * Lança erro se a API estiver inacessível — quem chamar deve
 * decidir se mostra o erro ou apenas mantém o cache antigo na tela.
 */
export async function syncTrackerHistory(
    trackerId: string,
    imei: string
): Promise<SyncResult> {
    const [stoppedLocations, routeSummaries] = await Promise.all([
        fetchStoppedLocations(imei),
        fetchRoutes(imei),
    ]);

    const locations = stoppedLocations.map(toTrackerLocation);
    await replaceLocationHistory(trackerId, locations);

    // Busca o detalhe (com os pontos) de cada rota do resumo.
    // Se uma rota específica falhar ao buscar, ela é ignorada em
    // vez de derrubar a sincronização inteira.
    const routeDetails = await Promise.all(
        routeSummaries.map(summary =>
            fetchRouteDetail(imei, summary.id).catch(error => {
                console.warn(
                    `Erro ao buscar detalhe da rota ${summary.id}:`,
                    error
                );
                return null;
            })
        )
    );

    const routes: TrackerRoute[] = routeDetails
        .filter(
            (detail): detail is ApiRouteDetail => detail !== null
        )
        .map(detail => toTrackerRoute(trackerId, detail));

    await replaceTrackerRoutes(trackerId, routes);

    return { locations, routes };
}