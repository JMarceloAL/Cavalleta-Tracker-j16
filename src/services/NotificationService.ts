// src/services/NotificationService.ts
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

export async function sendMovementNotification(trackerName: string) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🚨 Modo Vigilante',
            body: `${trackerName} está em movimento!`,
            sound: true,
        },
        trigger: null, // dispara imediatamente
    });
}