// src/services/Smsgateway.js
import { PermissionsAndroid, Platform } from 'react-native';
import {
    sendSms,
    startListening,
    stopListening,
    addSmsReceivedListener,
} from '../../modules/expo-sms-native/src';

export async function requestSmsPermissions() {
    if (Platform.OS !== 'android') {
        throw new Error('Envio/recebimento silencioso de SMS só é suportado no Android.');
    }

    const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
    ]);

    const denied = Object.entries(granted).filter(
        ([, status]) => status !== PermissionsAndroid.RESULTS.GRANTED
    );

    if (denied.length > 0) {
        const deniedNames = denied.map(([permission]) => permission).join(', ');
        throw new Error(
            `Permissões de SMS não concedidas: ${deniedNames}. ` +
            `Verifique em Ajustes > Apps > Permissões > SMS.`
        );
    }

    return true;
}

export function sendSmsToTracker(trackerPhoneNumber, command) {
    return sendSms(trackerPhoneNumber, command);
}

export function listenForIncomingSms(onMessage) {
    startListening();

    const subscription = addSmsReceivedListener((message) => {
        onMessage({
            originatingAddress: message.originatingAddress,
            body: message.body,
            timestamp: message.timestamp,
        });
    });

    return () => {
        subscription.remove();
        stopListening();
    };
}