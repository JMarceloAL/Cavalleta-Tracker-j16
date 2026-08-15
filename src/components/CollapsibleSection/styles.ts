// src/components/CollapsibleSection/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E6EAE0',
        overflow: 'hidden',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#EDF5E4',
    },

    headerText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F241C',
    },

    content: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 12,
    },
});