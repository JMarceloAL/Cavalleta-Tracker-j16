// src/components/ScreenTransitionOverlay/index.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { styles } from './styles';
import { APP_GREEN } from '../../theme/colors';

type Props = {
    visible: boolean;
};

export default function ScreenTransitionOverlay({ visible }: Props) {
    if (!visible) return null;

    return (
        <View style={styles.overlay} pointerEvents="none">
            <ActivityIndicator size="large" color={APP_GREEN} />
        </View>
    );
}
