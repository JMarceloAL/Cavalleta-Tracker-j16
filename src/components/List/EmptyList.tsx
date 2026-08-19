import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';

interface Props {
    // Opcional: se passado, exibe um botão de atalho para cadastrar
    onAdd?: () => void;
}

export default function EmptyList({ onAdd }: Props) {
    const { isDark } = useTheme();

    return (
        <View style={[styles.container, isDark && styles.darkContainer]}>
            <View style={[styles.iconCircle, isDark && styles.darkIconCircle]}>
                <MaterialIcons name="add-location-alt" size={32} color="rgb(163, 204, 127)" />
            </View>

            <Text style={[styles.title, isDark && styles.darkTitle]}>Nenhum rastreador cadastrado</Text>
            <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
                Cadastre um rastreador com nome e número do chip para começar a monitorar.
            </Text>

            {onAdd && (
                <TouchableOpacity style={styles.button} onPress={onAdd} activeOpacity={0.85}>
                    <MaterialIcons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Adicionar Rastreador</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}