import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_GREEN, APP_GREEN_DARK } from '../../theme/colors';
import { styles } from './styles';

type Props = {
    /**
     * true = câmera acompanhando o rastreador (modo "seguir")
     * false = mapa livre, usuário navegou por conta própria
     */
    followEnabled: boolean;

    onPress: () => void;
};

export default function RecenterButton({
    followEnabled,
    onPress,
}: Props) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: followEnabled
                        ? APP_GREEN
                        : '#FFFFFF',
                    borderColor: followEnabled
                        ? APP_GREEN_DARK
                        : '#DDE9D2',
                    shadowColor: followEnabled
                        ? `${APP_GREEN}55`
                        : 'rgba(15, 23, 42, 0.12)',
                    shadowOpacity: followEnabled ? 0.3 : 0.2,
                    shadowRadius: followEnabled ? 9 : 7,
                    elevation: followEnabled ? 5 : 4,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <Ionicons
                name={
                    followEnabled
                        ? 'locate'
                        : 'locate-outline'
                }
                size={22}
                color={
                    followEnabled
                        ? '#F7FFF3'
                        : APP_GREEN
                }
            />
        </TouchableOpacity>
    );
}