import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EAF0E5',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    darkCard: {
        backgroundColor: '#1D2733',
        borderColor: '#314254',
        shadowColor: '#000',
        shadowOpacity: 0.22,
    },
    selectedCard: {
        borderColor: 'rgba(86, 172, 0, 0.9)',
        backgroundColor: '#F9FBF7',
        shadowColor: 'rgba(86, 172, 0, 0.34)',
        shadowOpacity: 0.38,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
    },
    darkSelectedCard: {
        backgroundColor: '#1F2A36',
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 16,
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
        paddingRight: 8,
    },

    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F241C',
        letterSpacing: -0.2,
    },
    darkName: {
        color: '#F3F4F6',
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },

    phone: {
        fontSize: 13,
        color: '#75806D',
        marginLeft: 6,
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
        width: 36,
        height: 36,
        borderRadius: 12,
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