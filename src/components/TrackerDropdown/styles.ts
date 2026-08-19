import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 10,
        left: 16,
        right: 16,
        zIndex: 10,
    },
    header: {
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
    darkHeader: {
        backgroundColor: '#1D2733',
    },
    headerText: { fontSize: 15, fontWeight: '600', color: '#222', flex: 1 },
    darkHeaderText: { color: '#F3F4F6' },
    chevron: { fontSize: 12, color: '#666', marginLeft: 8 },
    darkChevron: { color: '#AFB9C7' },
    list: {
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
    darkList: {
        backgroundColor: '#1D2733',
    },
    item: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    darkItem: {
        borderBottomColor: '#334155',
    },
    itemText: { fontSize: 14, fontWeight: '500', color: '#222' },
    darkItemText: { color: '#F3F4F6' },
    itemSubtext: { fontSize: 12, color: '#888', marginTop: 2 },
    darkItemSubtext: { color: '#AFB9C7' },
    emptyText: { padding: 16, textAlign: 'center', color: '#888' },
    darkEmptyText: { color: '#AFB9C7' },
});