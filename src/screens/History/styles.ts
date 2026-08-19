// src/screens/History/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    darkContainer: {
        backgroundColor: '#121821',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
        marginBottom: 16,
    },

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
    darkDropdownHeader: {
        backgroundColor: '#1D2733',
    },
    dropdownHeaderText: { fontSize: 15, fontWeight: '600', color: '#222', flex: 1 },
    darkDropdownHeaderText: { color: '#F3F4F6' },
    chevron: { fontSize: 12, color: '#666', marginLeft: 8 },
    darkChevron: { color: '#AFB9C7' },
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
    darkDropdownList: {
        backgroundColor: '#1D2733',
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    darkDropdownItem: {
        borderBottomColor: '#334155',
    },
    dropdownItemText: { fontSize: 14, fontWeight: '500', color: '#222' },
    darkDropdownItemText: { color: '#F3F4F6' },
    dropdownItemSubtext: { fontSize: 12, color: '#888', marginTop: 2 },
    darkDropdownItemSubtext: { color: '#AFB9C7' },
    emptyText: { padding: 16, textAlign: 'center', color: '#888' },
    darkEmptyText: { color: '#AFB9C7' },

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
    darkFolder: {
        backgroundColor: '#1D2733',
    },
    folderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 8,
    },
    darkFolderHeader: {
        borderBottomColor: '#334155',
    },
    folderHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    darkFolderHeaderText: { color: '#F3F4F6' },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    darkHistoryItem: {
        borderBottomColor: '#334155',
    },
    historyItemTitle: { fontSize: 13, fontWeight: '600', color: '#333' },
    darkHistoryItemTitle: { color: '#F3F4F6' },
    historyItemCoords: { fontSize: 12, color: '#666', marginTop: 2 },
    darkHistoryItemCoords: { color: '#AFB9C7' },
    historyItemDate: { fontSize: 11, color: '#999', marginTop: 2 },
    darkHistoryItemDate: { color: '#CBD5E1' },
});