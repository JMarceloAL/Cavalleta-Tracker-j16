import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
                        ? 'rgb(163, 204, 127)'
                        : '#FFFFFF',
                },
            ]}
            onPress={onPress}
            activeOpacity={0.85}
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
                        ? '#FFFFFF'
                        : 'rgb(163, 204, 127)'
                }
            />
        </TouchableOpacity>
    );
}