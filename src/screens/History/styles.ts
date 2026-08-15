// src/screens/History/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
        marginBottom: 16,
    },

    // Dropdown de seleção de rastreador (mesmo padrão do TrackerDropdown)
    dropdownContainer: {
        zIndex: 10,
        marginBottom: 12,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    dropdownHeaderText: { fontSize: 15, fontWeight: '600', color: '#222', flex: 1 },
    chevron: { fontSize: 12, color: '#666', marginLeft: 8 },
    dropdownList: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 4,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownItemText: { fontSize: 14, fontWeight: '500', color: '#222' },
    dropdownItemSubtext: { fontSize: 12, color: '#888', marginTop: 2 },
    emptyText: { padding: 16, textAlign: 'center', color: '#888' },

    // "Pasta" com o histórico de localizações
    folder: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        flex: 1,
    },
    folderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 8,
    },
    folderHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    historyItemTitle: { fontSize: 13, fontWeight: '600', color: '#333' },
    historyItemCoords: { fontSize: 12, color: '#666', marginTop: 2 },
    historyItemDate: { fontSize: 11, color: '#999', marginTop: 2 },
});