import { NativeModule, requireNativeModule } from 'expo';

export type SmsReceivedEventPayload = {
    originatingAddress: string;
    body: string;
    timestamp: number;
};

declare class ExpoSmsNativeModule extends NativeModule<{
    onSmsReceived: (event: SmsReceivedEventPayload) => void;
}> {
    sendSms(phoneNumber: string, message: string): Promise<boolean>;
    startListening(): void;
    stopListening(): void;
}

export default requireNativeModule<ExpoSmsNativeModule>('ExpoSmsNative');