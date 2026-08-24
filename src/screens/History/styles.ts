import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // ============================================================
    // CONTAINER
    // ============================================================

    container: {
        flex: 1,
        backgroundColor: '#F5F7F2',
        padding: 16,
    },

    darkContainer: {
        backgroundColor: '#121821',
    },

    // ============================================================
    // TÍTULO
    // ============================================================

    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F241C',
        marginBottom: 16,
    },

    darkTitle: {
        color: '#F3F4F6',
    },

    // ============================================================
    // DROPDOWN
    // ============================================================

    dropdownContainer: {
        zIndex: 10,
        marginBottom: 12,
    },

    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        backgroundColor: '#FFFFFF',

        borderRadius: 8,

        paddingHorizontal: 16,
        paddingVertical: 12,

        elevation: 4,

        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    darkDropdownHeader: {
        backgroundColor: '#1B2430',
        borderWidth: 1,
        borderColor: '#2D3745',
    },

    dropdownHeaderText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222222',
        flex: 1,
    },

    darkDropdownHeaderText: {
        color: '#F3F4F6',
    },

    chevron: {
        fontSize: 12,
        color: '#666666',
        marginLeft: 8,
    },

    darkChevron: {
        color: '#AEB8C5',
    },

    dropdownList: {
        backgroundColor: '#FFFFFF',

        borderRadius: 8,

        marginTop: 4,

        elevation: 4,

        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },

        overflow: 'hidden',
    },

    darkDropdownList: {
        backgroundColor: '#1B2430',
        borderWidth: 1,
        borderColor: '#2D3745',
    },

    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,

        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },

    darkDropdownItem: {
        borderBottomColor: '#303A48',
    },

    dropdownItemText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#222222',
    },

    darkDropdownItemText: {
        color: '#F3F4F6',
    },

    dropdownItemSubtext: {
        fontSize: 12,
        color: '#888888',
        marginTop: 2,
    },

    darkDropdownItemSubtext: {
        color: '#9DA8B7',
    },

    // ============================================================
    // TEXTOS VAZIOS
    // ============================================================

    emptyText: {
        padding: 16,
        textAlign: 'center',
        color: '#888888',
    },

    darkEmptyText: {
        color: '#9DA8B7',
    },

    // ============================================================
    // ABAS
    // ============================================================

    tabRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },

    tabButton: {
        flex: 1,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#FFFFFF',

        borderRadius: 10,

        paddingVertical: 10,

        borderWidth: 1,
        borderColor: '#E6EAE0',
    },

    darkTabButton: {
        backgroundColor: '#1B2430',
        borderColor: '#303A48',
    },

    tabButtonActive: {
        backgroundColor: 'rgb(163, 204, 127)',
        borderColor: 'rgb(163, 204, 127)',
    },

    tabButtonText: {
        fontSize: 13,
        fontWeight: '700',

        color: 'rgb(110, 148, 80)',

        marginLeft: 6,
    },

    darkTabButtonText: {
        color: '#B8D89A',
    },

    tabButtonTextActive: {
        color: '#FFFFFF',
    },

    // ============================================================
    // PASTA / ÁREA DO HISTÓRICO
    // ============================================================

    folder: {
        backgroundColor: '#FFFFFF',

        borderRadius: 8,

        padding: 12,

        elevation: 3,

        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },

        flex: 1,
    },

    darkFolder: {
        backgroundColor: '#1B2430',

        borderWidth: 1,
        borderColor: '#2D3745',
    },

    folderHeader: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingBottom: 10,

        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',

        marginBottom: 8,
    },

    darkFolderHeader: {
        borderBottomColor: '#303A48',
    },

    folderHeaderText: {
        fontSize: 14,
        fontWeight: '600',

        color: '#333333',

        marginLeft: 8,

        flex: 1,
    },

    darkFolderHeaderText: {
        color: '#F3F4F6',
    },

    // ============================================================
    // ITEM DO HISTÓRICO
    // ============================================================

    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingVertical: 12,

        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    darkHistoryItem: {
        borderBottomColor: '#303A48',
    },

    historyItemTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333333',
    },

    darkHistoryItemTitle: {
        color: '#F3F4F6',
    },

    historyItemCoords: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },

    darkHistoryItemCoords: {
        color: '#B0BAC8',
    },

    historyItemDate: {
        fontSize: 11,
        color: '#999999',
        marginTop: 2,
    },

    darkHistoryItemDate: {
        color: '#8995A5',
    },

    // ============================================================
    // ÍCONES
    // ============================================================

    historyIcon: {
        color: '#888888',
    },

    darkHistoryIcon: {
        color: '#AEB8C5',
    },

    chevronIcon: {
        color: '#CCCCCC',
    },

    darkChevronIcon: {
        color: '#667384',
    },
});