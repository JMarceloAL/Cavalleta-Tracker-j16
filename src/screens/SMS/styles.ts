// src/screens/SMS/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F2',
    },

    header: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },

    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F241C',
        letterSpacing: -0.3,
    },

    subtitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#75806D',
        letterSpacing: 0.4,
        marginTop: 4,
        textTransform: 'uppercase',
    },

    scrollContent: {
        padding: 20,
        paddingTop: 76, // espaço pro TrackerDropdown flutuante
        paddingBottom: 40,
    },

    list: {
        gap: 8,
        alignItems: 'flex-start',
    },

    listButton: {
        backgroundColor: 'rgb(163, 204, 127)',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },

    buttonDestructive: {
        backgroundColor: '#D95C5C',
    },

    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },

    responseBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E6EAE0',
    },

    responseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    responseCommand: {
        fontSize: 12,
        fontWeight: '600',
        color: '#75806D',
        marginLeft: 6,
    },

    responseText: {
        fontSize: 14,
        color: '#1F241C',
        lineHeight: 20,
    },
});