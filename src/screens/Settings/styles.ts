import { StyleSheet } from 'react-native';
import { APP_GREEN } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F7F2',
    },
    darkContainer: {
        backgroundColor: '#121821',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    menuButton: {
        marginRight: 12,
        padding: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111',
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
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    themeSelector: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },
    darkThemeSelector: {
        borderColor: '#334155',
    },
    themeSelectorMain: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    themeHeaderLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    themeSelectorTextWrap: {
        flex: 1,
        marginLeft: 10,
    },
    themeMenu: {
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 6,
        marginBottom: 12,
    },
    themeMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 8,
        marginVertical: 4,
    },
    themeMenuItemTextWrap: {
        flex: 1,
        marginLeft: 8,
    },
    themeButton: {
        width: '48%',
        borderRadius: 14,
        padding: 12,
        backgroundColor: '#F7F9F5',
        borderWidth: 1,
        borderColor: '#EAEFE5',
        marginBottom: 10,
    },
    darkThemeButton: {
        backgroundColor: '#1D2733',
        borderColor: '#334155',
    },
    themeButtonActive: {
        borderColor: APP_GREEN,
        backgroundColor: '#F4FAEE',
    },
    themePreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    themePreviewSwatch: {
        width: 22,
        height: 22,
        borderRadius: 11,
        marginRight: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    themeButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    themeButtonTextActive: {
        color: APP_GREEN,
    },
    themeButtonDescription: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 4,
    },
    themeButtonDescriptionActive: {
        color: '#3B6A0E',
    },
    darkToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EAEFE5',
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
        backgroundColor: APP_GREEN,
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