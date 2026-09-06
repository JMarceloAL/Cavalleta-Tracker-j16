// src/screens/SMS/styles.ts
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
        paddingTop: 32,
        paddingBottom: 12,
    },

    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1F241C',
        letterSpacing: -0.3,
    },

    subtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#75806D',
        letterSpacing: 0.4,
        marginTop: 4,
        textTransform: 'uppercase',
    },

    scrollContent: {
        padding: 20,
        paddingTop: 76,
        paddingBottom: 40,
    },

    list: {
        gap: 8,
        alignItems: 'stretch',
    },
    lockedBox: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    lockedText: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 8,
        marginBottom: 16,
        textAlign: 'center',
    },
    darkLockedText: {
        color: '#AFB9C7',
    },
    unlockButton: {
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 24,
        elevation: 2,
    },
    protectedSectionContainer: {
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 16,
        marginBottom: 16,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderColor: '#EAF0E5',
    },
    protectedSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    protectedSectionHeaderTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    protectedSectionLockIcon: {
        marginRight: 6,
        left: 10,
    },
    protectedSectionHeaderText: {
        fontSize: 15,
        fontWeight: '600',
    },
    protectedSectionChevron: {
        fontSize: 12,
    },
    protectedSectionContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    unlockButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    listButton: {
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },

    buttonDestructive: {
        backgroundColor: '#D95C5C',
    },

    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center',
    },

    responseBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E6EAE0',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    darkResponseBox: {
        backgroundColor: '#1D2733',
        borderColor: '#334155',
    },

    responseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    responseCommand: {
        fontSize: 12,
        fontWeight: '600',
        color: '#75806D',
        marginLeft: 6,
    },
    darkResponseCommand: {
        color: '#AFB9C7',
    },

    responseText: {
        fontSize: 14,
        color: '#1F241C',
        lineHeight: 20,
    },
    darkResponseText: {
        color: '#F3F4F6',
    },
});