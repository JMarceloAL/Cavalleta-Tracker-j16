import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    button: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        position: 'absolute',
        bottom: 30,
        right: 16,
    },
});