// src/services/storage/LastlocationStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TrackerLocation } from '../../types/Tracker';

const PREFIX = '@cavalleta:lastLocation:';
const MAX_HISTORY = 10;

/**
 * Salva uma nova localização no histórico do rastreador, mantendo
 * apenas as últimas MAX_HISTORY entradas (a mais recente sempre em [0]).
 */
export async function saveLastLocation(trackerId: string, location: TrackerLocation) {
    try {
        const history = await getLocationHistory(trackerId);
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