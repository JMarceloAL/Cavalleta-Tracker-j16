import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F7F2',
    },
    darkContainer: {
        backgroundColor: '#121821',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 24,
    },
    darkText: {
        color: '#F3F4F6',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 18,
    },
    darkRow: {
        backgroundColor: '#1D2733',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    darkLabel: {
        color: '#F3F4F6',
    },
    help: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    darkHelp: {
        color: '#AFB9C7',
    },
    section: {
        marginTop: 8,
    },
    form: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 18,
    },
    darkForm: {
        backgroundColor: '#1D2733',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: '#111827',
        marginBottom: 12,
    },
    darkInput: {
        borderColor: '#334155',
        backgroundColor: '#18212d',
        color: '#F3F4F6',
    },
    button: {
        backgroundColor: 'rgb(163, 204, 127)',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#E5E7EB',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    secondaryButtonText: {
        color: '#111827',
        fontWeight: '700',
    },
    dangerText: {
        color: '#D16666',
    },
    infoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    infoButtonText: {
        color: '#111827',
        fontWeight: '600',
    },
    darkInfoButtonText: {
        color: '#F3F4F6',
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownContent: {
        marginTop: 16,
    },
    dangerButton: {
        backgroundColor: '#D32F2F',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    dangerButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
});
