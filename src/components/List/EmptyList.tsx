import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { styles } from './styles';

interface Props {
    // Opcional: se passado, exibe um botão de atalho para cadastrar
    onAdd?: () => void;
}

export default function EmptyList({ onAdd }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.iconCircle}>
                <MaterialIcons name="add-location-alt" size={32} color="rgb(163, 204, 127)" />
            </View>

            <Text style={styles.title}>Nenhum rastreador cadastrado</Text>
            <Text style={styles.subtitle}>
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