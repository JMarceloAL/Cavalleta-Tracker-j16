// src/services/storage/LastlocationStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TrackerLocation } from '../../types/Tracker';

const PREFIX = '@cavalleta:lastLocation:';
const MAX_HISTORY = 10;
const STOPPED_PREFIX = '@cavalleta:stoppedLocation:';

/**
 * Salva a última posição válida do rastreador, mas ignora duplicatas quando
 * ele está parado. Só registra uma nova posição quando ela muda de forma
 * relevante em relação à última coordenada salva.
 */
export async function saveLastLocation(trackerId: string, location: TrackerLocation) {
    try {
        const history = await getLocationHistory(trackerId);
        const previous = history[0];

        if (previous) {
            const latDelta = Math.abs((previous.latitude ?? 0) - (location.latitude ?? 0));
            const lngDelta = Math.abs((previous.longitude ?? 0) - (location.longitude ?? 0));
            const hasChanged = latDelta > 0.0001 || lngDelta > 0.0001;

            if (!hasChanged) {
                return;
            }
        }

        const nextHistory = [location, ...history].slice(0, MAX_HISTORY);
        await AsyncStorage.setItem(`${PREFIX}${trackerId}`, JSON.stringify(nextHistory));
    } catch (error) {
        console.warn('Erro ao salvar última localização', error);
    }
}

/** Retorna só a localização mais recente (mesmo comportamento de antes) */
export async function getLastLocation(trackerId: string): Promise<TrackerLocation | null> {
    const history = await getLocationHistory(trackerId);
    return history[0] ?? null;
}

/** Retorna o histórico completo (até MAX_HISTORY), mais recente primeiro */
export async function getLocationHistory(trackerId: string): Promise<TrackerLocation[]> {
    try {
        const stored = await AsyncStorage.getItem(`${PREFIX}${trackerId}`);
        if (!stored) return [];

        const parsed = JSON.parse(stored);

        // Compatibilidade: versão antiga guardava um único objeto (não
        // array). Se encontrar isso, converte para uma lista de 1 item.
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
    } catch (error) {
        console.warn('Erro ao carregar histórico de localizações', error);
        return [];
    }
}

/**
 * Sobrescreve todo o histórico de localizações do rastreador com os
 * dados vindos da API (sincronização servidor -> cache local).
 *
 * Diferente de saveLastLocation (que só acrescenta uma nova posição
 * de cada vez, ignorando duplicatas), essa função substitui o cache
 * inteiro pelo que o servidor tem, garantindo que o app fique
 * consistente mesmo se o histórico local estiver desatualizado ou
 * tiver sido perdido (reinstalação, storage limpo etc.).
 */
export async function replaceLocationHistory(
    trackerId: string,
    locations: TrackerLocation[]
): Promise<void> {
    try {
        const limited = locations.slice(0, MAX_HISTORY);

        await AsyncStorage.setItem(
            `${PREFIX}${trackerId}`,
            JSON.stringify(limited)
        );
    } catch (error) {
        console.warn('Erro ao sincronizar histórico de localizações', error);
    }
}

/**
 * Salva a última posição em que o rastreador foi visto "parado"
 * (speed baixo). Serve de referência para o Modo Vigilante detectar
 * quando ele voltar a se mover.
 */
export async function saveStoppedLocation(trackerId: string, location: TrackerLocation) {
    try {
        await AsyncStorage.setItem(`${STOPPED_PREFIX}${trackerId}`, JSON.stringify(location));
    } catch (error) {
        console.warn('Erro ao salvar última localização parada', error);
    }
}

/** Retorna a última posição "parada" conhecida, usada como referência pelo Modo Vigilante */
export async function getStoppedLocation(trackerId: string): Promise<TrackerLocation | null> {
    try {
        const stored = await AsyncStorage.getItem(`${STOPPED_PREFIX}${trackerId}`);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.warn('Erro ao carregar última localização parada', error);
        return null;
    }
}