// src/screens/Info/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F2',
    },
    darkContainer: {
        backgroundColor: '#121821',
    },

    scrollContent: {
        padding: 20,
        paddingTop: 32,
        paddingBottom: 40,
        alignItems: 'center',
    },

    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EDF5E4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },

    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
    },
    darkText: {
        color: '#F3F4F6',
    },

    tagline: {
        fontSize: 13,
        fontWeight: '600',
        color: '#75806D',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 24,
        letterSpacing: 0.2,
    },
    darkTagline: {
        color: '#AFB9C7',
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
        alignSelf: 'flex-start',
        marginBottom: 8,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },

    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 18,
        marginBottom: 20,
    },
    darkCard: {
        backgroundColor: '#1D2733',
    },

    paragraph: {
        fontSize: 14,
        lineHeight: 21,
        color: '#374151',
    },
    darkParagraph: {
        color: '#D1D9E6',
    },

    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginLeft: 6,
    },
    darkBadgeText: {
        color: '#AFB9C7',
    },

    // Lista de recursos
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingBottom: 14,
        marginBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2ED',
    },
    featureRowLast: {
        paddingBottom: 0,
        marginBottom: 0,
        borderBottomWidth: 0,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EDF5E4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureTextGroup: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F241C',
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: 12.5,
        lineHeight: 18,
        color: '#6B7280',
    },

    // Botão GitHub
    githubButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1F2328',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '100%',
        marginTop: 16,
    },
    githubButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        marginLeft: 8,
    },

    repoUrl: {
        marginTop: 12,
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    darkRepoUrl: {
        color: '#AFB9C7',
    },

    footer: {
        fontSize: 12,
        color: '#9AA294',
        textAlign: 'center',
        marginTop: 8,
    },
    darkFooter: {
        color: '#6B7A8F',
    },
});