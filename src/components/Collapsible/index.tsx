// src/components/Collapsible/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, LayoutChangeEvent, Easing } from 'react-native';

import { styles } from './styles';

type Props = {
    open: boolean;
    children: React.ReactNode;
};

export default function Collapsible({ open, children }: Props) {
    const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
    const heightAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(open ? 1 : 0)).current;

    function handleContentLayout(e: LayoutChangeEvent) {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && h !== measuredHeight) {
            setMeasuredHeight(h);
        }
    }

    useEffect(() => {
        if (measuredHeight === null) return;

        const duration = 180;

        Animated.parallel([
            Animated.timing(heightAnim, {
                toValue: open ? measuredHeight : 0,
                duration,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(opacityAnim, {
                toValue: open ? 1 : 0,
                duration: open ? duration : duration - 40,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();
    }, [open, measuredHeight, heightAnim, opacityAnim]);

    return (
        <View>
            <View style={styles.measure} pointerEvents="none">
                <View onLayout={handleContentLayout}>{children}</View>
            </View>

            <Animated.View
                style={{
                    height: heightAnim,
                    opacity: opacityAnim,
                    overflow: 'hidden',
                }}
            >
                {children}
            </Animated.View>
        </View>
    );
}
