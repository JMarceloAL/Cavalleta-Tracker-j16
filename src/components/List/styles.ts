import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    darkContainer: {
        backgroundColor: '#121821',
    },

    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#EDF5E4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    darkIconCircle: {
        backgroundColor: '#243041',
    },

    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F241C',
        textAlign: 'center',
    },
    darkTitle: {
        color: '#F3F4F6',
    },

    subtitle: {
        fontSize: 13,
        color: '#75806D',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 19,
    },
    darkSubtitle: {
        color: '#AFB9C7',
    },

    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgb(163, 204, 127)',
        borderRadius: 22,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 24,
    },

    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        marginLeft: 6,
    },
});