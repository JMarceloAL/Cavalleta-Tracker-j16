import { registerWebModule, NativeModule } from 'expo';

class ExpoSmsNativeModule extends NativeModule<{}> {}

export default registerWebModule(ExpoSmsNativeModule, 'ExpoSmsNativeModule');
