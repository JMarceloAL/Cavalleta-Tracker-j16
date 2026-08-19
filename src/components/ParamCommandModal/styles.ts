import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    darkContainer: {
        backgroundColor: '#1D2733',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#111',
    },
    darkTitle: {
        color: '#F3F4F6',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    darkInput: {
        borderColor: '#334155',
        backgroundColor: '#18212d',
        color: '#F3F4F6',
    },
    primaryButton: {
        backgroundColor: 'rgb(163, 204, 127)',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    cancelButtonText: {
        color: '#888',
        fontSize: 14,
    },
    darkCancelButtonText: {
        color: '#FCA5A5',
    },
});
