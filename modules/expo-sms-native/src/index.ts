import ExpoSmsNativeModule, { type SmsReceivedEventPayload } from './ExpoSmsNativeModule';

export type { SmsReceivedEventPayload };

export async function sendSms(phoneNumber: string, message: string): Promise<boolean> {
    return await ExpoSmsNativeModule.sendSms(phoneNumber, message);
}

export function startListening(): void {
    ExpoSmsNativeModule.startListening();
}

export function stopListening(): void {
    ExpoSmsNativeModule.stopListening();
}

export function addSmsReceivedListener(
    listener: (event: SmsReceivedEventPayload) => void
) {
    return ExpoSmsNativeModule.addListener('onSmsReceived', listener);
}