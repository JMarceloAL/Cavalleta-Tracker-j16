import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E6EAE0',
    },
    darkCard: {
        backgroundColor: '#1D2733',
        borderColor: '#334155',
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#EDF5E4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    darkAvatar: {
        backgroundColor: '#243041',
    },

    info: {
        flex: 1,
    },

    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F241C',
    },
    darkName: {
        color: '#F3F4F6',
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },

    phone: {
        fontSize: 13,
        color: '#75806D',
        marginLeft: 4,
    },
    darkPhone: {
        color: '#AFB9C7',
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },

    statusText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },

    actionButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    darkEditButton: {
        backgroundColor: '#243041',
    },
    darkDeleteButton: {
        backgroundColor: '#3A2A2A',
    },

    chevron: {
        marginLeft: 2,
    },
});