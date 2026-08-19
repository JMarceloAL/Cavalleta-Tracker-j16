import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F2',
    },
    darkContainer: {
        backgroundColor: '#121821',
    },

    header: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    darkHeader: {
        backgroundColor: '#121821',
    },

    headerTextGroup: {
        flex: 1,
        marginRight: 12,
    },

    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F241C',
        letterSpacing: -0.3,
    },
    darkTitle: {
        color: '#F3F4F6',
    },

    subtitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#75806D',
        letterSpacing: 0.4,
        marginTop: 4,
        textTransform: 'uppercase',
    },
    darkSubtitle: {
        color: '#AFB9C7',
    },

    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgb(163, 204, 127)',
        borderRadius: 22,
        paddingVertical: 10,
        paddingHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },

    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        marginLeft: 4,
    },

    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        flexGrow: 1,
    },

    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
    },
});