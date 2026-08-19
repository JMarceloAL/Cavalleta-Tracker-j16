import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
    },
    darkContainer: {
        backgroundColor: '#1D2733',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#111',
    },
    darkTitle: {
        color: '#F3F4F6',
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
        marginBottom: 15,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    darkInput: {
        borderColor: '#334155',
        backgroundColor: '#18212d',
        color: '#F3F4F6',
    },
    inputSpacing: {
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: 'rgb(163, 204, 127)',
        height: 45,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#D32F2F',
        fontWeight: 'bold',
    },
    darkCancelButtonText: {
        color: '#FCA5A5',
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: 'rgb(163, 204, 127)',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    secondaryButtonDisabled: {
        opacity: 0.6,
    },
    secondaryButtonText: {
        color: 'rgb(163, 204, 127)',
        fontWeight: '600',
        fontSize: 14,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 220,
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 14,
        fontSize: 14,
        fontWeight: '600',
        color: '#1F241C',
        textAlign: 'center',
    },
    darkLoadingText: {
        color: '#F3F4F6',
    },
});
