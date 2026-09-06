import { StyleSheet } from 'react-native';

import { APP_GREEN } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F6EF',
    },
    darkContainer: {
        backgroundColor: '#121821',
    },

    header: {
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EAF0E5',
        backgroundColor: '#F9FBF7',
    },
    darkHeader: {
        backgroundColor: '#121821',
        borderBottomColor: '#2E3B4D',
    },

    headerTextGroup: {
        flex: 1,
        marginRight: 12,
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F241C',
        letterSpacing: -0.5,
    },
    darkTitle: {
        color: '#F3F4F6',
    },

    subtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#75806D',
        letterSpacing: 0.5,
        marginTop: 6,
        textTransform: 'uppercase',
    },
    darkSubtitle: {
        color: '#AFB9C7',
    },

    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: APP_GREEN,
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 18,
        elevation: 4,
        shadowColor: `${APP_GREEN}66`,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },

    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        marginLeft: 4,
    },

    listContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 28,
        flexGrow: 1,
    },

    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
    },
});