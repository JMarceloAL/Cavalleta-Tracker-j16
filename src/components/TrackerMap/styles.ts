import {
    StyleSheet,
} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    marker: {
        width: 20,
        height: 20,

        borderRadius: 10,

        backgroundColor:
            '#1E90FF',

        borderWidth: 3,

        borderColor:
            '#FFFFFF',

        elevation: 5,

        shadowColor:
            '#000000',

        shadowOpacity:
            0.3,

        shadowRadius:
            4,

        shadowOffset: {
            width: 0,
            height: 2,
        },
    },
});