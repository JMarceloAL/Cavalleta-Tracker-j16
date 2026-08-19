// src/components/CollapsibleSection/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

    container: {
        marginTop: 16,
        borderRadius: 10,
        borderWidth: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '700',
    },
    chevron: {
        fontSize: 12,
    },
    content: {
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
});