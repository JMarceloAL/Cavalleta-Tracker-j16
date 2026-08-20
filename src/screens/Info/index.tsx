// src/screens/Info/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';

const REPO_URL = 'https://github.com/JMarceloAL/Cavalleta-Tracker-j16';

const FEATURES = [
    {
        icon: 'sms',
        title: 'Controle total por SMS',
        description: 'Envie comandos de status, localização e parâmetros direto pro rastreador, sem depender de plataforma paga.',
    },
    {
        icon: 'radio-button-checked',
        title: 'Localização em tempo real',
        description: 'Acompanhe a posição do veículo ao vivo pela API do servidor, com atualização a cada poucos segundos.',
    },
    {
        icon: 'history',
        title: 'Histórico de localizações',
        description: 'Consulte as últimas posições registradas de cada rastreador e reveja qualquer uma delas no mapa.',
    },
    {
        icon: 'notifications-active',
        title: 'Modo Vigilante',
        description: 'Receba notificações automáticas caso o veículo saia do lugar onde estava parado.',
    },
    {
        icon: 'dark-mode',
        title: 'Tema claro e escuro',
        description: 'Interface adaptável, incluindo o mapa, pra usar como preferir a qualquer hora do dia.',
    },
] as const;

export default function InfoScreen() {
    const { isDark } = useTheme();

    const containerStyle = [styles.container, isDark && styles.darkContainer];
    const titleStyle = [styles.title, isDark && styles.darkText];
    const taglineStyle = [styles.tagline, isDark && styles.darkTagline];
    const sectionTitleStyle = [styles.sectionTitle, isDark && styles.darkText];
    const cardStyle = [styles.card, isDark && styles.darkCard];
    const paragraphStyle = [styles.paragraph, isDark && styles.darkParagraph];
    const badgeTextStyle = [styles.badgeText, isDark && styles.darkBadgeText];
    const repoUrlStyle = [styles.repoUrl, isDark && styles.darkRepoUrl];
    const featureTitleStyle = [styles.featureTitle, isDark && styles.darkText];
    const featureDescriptionStyle = [styles.featureDescription, isDark && styles.darkParagraph];
    const footerStyle = [styles.footer, isDark && styles.darkFooter];

    function handleOpenRepo() {
        Linking.openURL(REPO_URL).catch(() => undefined);
    }

    return (
        <SafeAreaView style={containerStyle}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.iconCircle}>
                    <MaterialIcons name="info-outline" size={32} color="rgb(163, 204, 127)" />
                </View>

                <Text style={titleStyle}>Cavalleta Connect</Text>
                <Text style={taglineStyle}>Monitoramento de rastreadores veiculares</Text>

                {/* Sobre o projeto */}
                <View style={cardStyle}>
                    <Text style={paragraphStyle}>
                        Este projeto foi feito para ajudar pessoas que utilizam rastreadores em
                        seus veículos. O app possibilita ter uma solução gratuita para monitorar
                        e gerenciar seu dispositivo rastreador, sem mensalidades e sem depender
                        de plataformas de terceiros.
                    </Text>

                    <View style={styles.badge}>
                        <MaterialIcons
                            name="lock-open"
                            size={14}
                            color={isDark ? '#AFB9C7' : '#6B7280'}
                        />
                        <Text style={badgeTextStyle}>Projeto open source</Text>
                    </View>
                </View>

                {/* Recursos */}
                <Text style={sectionTitleStyle}>Principais recursos</Text>

                <View style={cardStyle}>
                    {FEATURES.map((feature, index) => (
                        <View
                            key={feature.title}
                            style={[
                                styles.featureRow,
                                index === FEATURES.length - 1 && styles.featureRowLast,
                            ]}
                        >
                            <View style={styles.featureIcon}>
                                <MaterialIcons
                                    name={feature.icon as any}
                                    size={18}
                                    color="rgb(110, 148, 80)"
                                />
                            </View>

                            <View style={styles.featureTextGroup}>
                                <Text style={featureTitleStyle}>{feature.title}</Text>
                                <Text style={featureDescriptionStyle}>{feature.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Repositório */}
                <Text style={sectionTitleStyle}>Código-fonte</Text>

                <View style={cardStyle}>
                    <Text style={paragraphStyle}>
                        Todo o código deste app é aberto e pode ser consultado, copiado ou
                        modificado por qualquer pessoa. Contribuições, sugestões e relatos de
                        problemas são sempre bem-vindos no repositório.
                    </Text>

                    <TouchableOpacity
                        style={styles.githubButton}
                        onPress={handleOpenRepo}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="logo-github" size={20} color="#FFFFFF" />
                        <Text style={styles.githubButtonText}>Ver repositório no GitHub</Text>
                    </TouchableOpacity>

                    <Text style={repoUrlStyle}>{REPO_URL}</Text>
                </View>

                <Text style={footerStyle}>Feito com dedicação para a comunidade. 🐝</Text>
            </ScrollView>
        </SafeAreaView>
    );
}