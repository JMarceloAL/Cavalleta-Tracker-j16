import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 25,
        backgroundColor: '#F5F5F5',
    },
    darkContainer: {
        backgroundColor: '#121821',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1D2A1A',
        textAlign: 'center',
    },
    darkTitle: {
        color: '#F3F4F6',
    },
    subtitle: {
        fontSize: 16,
        color: '#616161',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 40,
    },
    darkSubtitle: {
        color: '#AFB9C7',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 15,
        fontSize: 16,
        color: '#111827',
    },
    darkInput: {
        backgroundColor: '#1D2733',
        borderColor: '#334155',
        color: '#F3F4F6',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 12,
        height: 50,
        marginBottom: 15,
    },
    darkInputContainer: {
        backgroundColor: '#1D2733',
        borderColor: '#334155',
    },
    inputIcon: {
        marginRight: 8,
    },
    inputWithIcon: {
        flex: 1,
        fontSize: 16,
        color: '#222',
    },
    darkInputText: {
        color: '#F3F4F6',
    },
    button: {
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    biometricButton: {
        alignSelf: 'center',
        marginVertical: 12,
        padding: 10,
        borderRadius: 40,
        borderWidth: 2,
    },

});