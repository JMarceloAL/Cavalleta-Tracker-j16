// mapcontrols styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

    container: {
        position: 'absolute',
        right: 10,
        bottom: 24,
        alignItems: 'flex-start',
    },
    fab: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgb(163, 204, 127)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 10,
        right: 345,
    },
    his: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgb(163, 204, 127)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 625,
        right: 345,
    },
    sms: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgb(163, 204, 127)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 625,
        right: 290,
    },

    // ============================================================
    // TEMPO REAL
    // ============================================================
    switchWrapper: {
        width: 90,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 630,
        right: 10,
    },

    // ============================================================
    // MODO VIGILANTE
    // ============================================================
    // Mesmo estilo do switchWrapper, só deslocado pra esquerda
    // (largura 90 + 10 de espaçamento = 100) pra não sobrepor
    // o toggle do Tempo Real.
    vigilanteSwitchWrapper: {
        width: 90,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 630,
        right: 110,
    },

    signalIcon: {
        top: 2,
        left: 5,
    },
    switch: {
        bottom: 25,
    },
});