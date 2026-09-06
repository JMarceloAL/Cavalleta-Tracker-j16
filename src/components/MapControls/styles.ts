// mapcontrols styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

    container: {
        position: 'absolute',
        right: 12,
        bottom: 18,
        alignItems: 'flex-start',
    },
    fab: {
        width: 46,
        height: 46,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 10,
        right: 345,
    },
    his: {
        width: 46,
        height: 46,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 615,
        right: 345,
    },
    sms: {
        width: 46,
        height: 46,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 615,
        right: 291,
    },

    // ============================================================
    // TEMPO REAL
    // ============================================================
    switchWrapper: {
        width: 106,
        height: 46,
        backgroundColor: '#F9FBF7',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#EAF0E5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 615,
        right: 10,
    },

    // ============================================================
    // MODO VIGILANTE
    // ============================================================
    vigilanteSwitchWrapper: {
        width: 106,
        height: 46,
        backgroundColor: '#F9FBF7',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#EAF0E5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 615,
        right: 126,
    },

    signalIcon: {
        marginRight: 6,
    },
    switch: {
        transform: [{ scale: 0.9 }],
    },
});