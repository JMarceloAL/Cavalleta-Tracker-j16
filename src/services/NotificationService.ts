import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ============================================================
// CONFIGURAÇÃO DAS NOTIFICAÇÕES
// ============================================================

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// ============================================================
// PERMISSÕES
// ============================================================

export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } =
            await Notifications.requestPermissionsAsync();

        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }

    // Android
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(
            'vigilante',
            {
                name: 'Vigilante',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lockscreenVisibility:
                    Notifications.AndroidNotificationVisibility.PUBLIC,
            }
        );
    }

    return true;
}

// ============================================================
// DATA/HORA
// ============================================================

function formatarDataHoraAgora(): string {
    return new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

// ============================================================
// MOVIMENTO
// ============================================================

export async function sendMovementNotification(
    trackerName: string
): Promise<void> {
    const dataHora = formatarDataHoraAgora();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🚨 Movimento detectado',
            body:
                `${trackerName} começou a se mover.\n` +
                `Data e hora: ${dataHora}`,
            data: {
                tipo: 'MOVIMENTO',
                trackerName,
                dataHora,
            },
        },

        // Envia imediatamente
        trigger: null,
    });
}

// ============================================================
// ALARME
// ============================================================

export async function sendAlarmNotification(
    trackerName: string,
    descricao: string,
    dataHora?: string
): Promise<void> {
    const data = dataHora || formatarDataHoraAgora();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🚨 ALARME ATIVADO',
            body:
                `${trackerName}\n` +
                `Alarme: ${descricao}\n` +
                `Data e hora: ${data}`,
            data: {
                tipo: 'ALARME',
                trackerName,
                descricao,
                dataHora: data,
            },
        },

        // Envia imediatamente
        trigger: null,
    });
}