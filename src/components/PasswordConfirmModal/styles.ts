import { StyleSheet } from 'react-native';
import { APP_GREEN } from '../../theme/colors';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
    },
    darkContainer: {
        backgroundColor: '#1D2733',
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#EDF5E4',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 12,
    },
    darkIconCircle: {
        backgroundColor: '#243041',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 4,
    },
    darkTitle: {
        color: '#F3F4F6',
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    darkSubtitle: {
        color: '#AFB9C7',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: '#111827',
        marginBottom: 16,
    },
    darkInput: {
        borderColor: '#334155',
        backgroundColor: '#18212d',
        color: '#F3F4F6',
    },
    primaryButton: {
        backgroundColor: APP_GREEN,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    cancelButtonText: {
        color: '#6B7280',
        fontWeight: '600',
    },
    darkCancelButtonText: {
        color: '#AFB9C7',
    },
});