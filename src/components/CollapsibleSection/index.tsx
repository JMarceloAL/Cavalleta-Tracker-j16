// src/components/CollapsibleSection/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';

type Props = {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
};

export default function CollapsibleSection({ title, children, defaultOpen = false }: Props) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setOpen(prev => !prev)}
                activeOpacity={0.8}
            >
                <Text style={styles.headerText}>{title}</Text>
                <MaterialIcons
                    name={open ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={22}
                    color="rgb(110, 148, 80)"
                />
            </TouchableOpacity>

            {open && <View style={styles.content}>{children}</View>}
        </View>
    );
}