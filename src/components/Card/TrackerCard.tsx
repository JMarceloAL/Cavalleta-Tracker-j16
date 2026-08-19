import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

import type { Tracker } from '../../types/Tracker';
import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';

interface Props {
    tracker: Tracker;
    onDelete(id: string): void;
    onLocate(id: string): void;
    onEdit(tracker: Tracker): void;
}

/**
 * Formata o número pra exibição, ex: "61999999999" -> "(61) 99999-9999".
 * Se não bater com 10/11 dígitos (formato já normalizado de forma
 * diferente, por exemplo), mostra o valor original sem quebrar a tela.
 */
function formatPhone(phone: string) {
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return phone;
}

export default function TrackerCard({
    tracker,
    onDelete,
    onLocate,
    onEdit,
}: Props) {
    const { isDark } = useTheme();
    const hasImei = Boolean(tracker.imei);

    return (
        <TouchableOpacity
            style={[styles.card, isDark && styles.darkCard]}
            activeOpacity={0.7}

        >
            <View style={[styles.avatar, isDark && styles.darkAvatar]}>
                <Ionicons name="radio-outline" size={22} color="rgb(163, 204, 127)" />
            </View>

            <View style={styles.info}>
                <Text style={[styles.name, isDark && styles.darkName]} numberOfLines={1}>
                    {tracker.name}
                </Text>

                <View style={styles.metaRow}>
                    <MaterialIcons name="phone" size={12} color={isDark ? '#AFB9C7' : '#75806D'} />
                    <Text style={[styles.phone, isDark && styles.darkPhone]}>{formatPhone(tracker.phone)}</Text>
                </View>


            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, isDark ? styles.darkEditButton : { backgroundColor: '#EDF5E4' }]}
                    onPress={() => onEdit(tracker)}
                >
                    <MaterialIcons name="edit" size={18} color={isDark ? '#A7F3D0' : 'rgb(110, 148, 80)'} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, isDark ? styles.darkDeleteButton : { backgroundColor: '#FBEAEA' }]}
                    onPress={() => onDelete(tracker.id)}
                >
                    <MaterialIcons name="delete-outline" size={18} color="#D95C5C" />
                </TouchableOpacity>
            </View>

            <MaterialIcons
                name="chevron-right"
                size={20}
                color={isDark ? '#AFB9C7' : '#C7CCC0'}
                style={styles.chevron}
            />
        </TouchableOpacity>
    );
}