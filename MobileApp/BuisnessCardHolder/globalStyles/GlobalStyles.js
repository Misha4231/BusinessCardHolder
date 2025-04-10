import { Dimensions, StyleSheet } from "react-native";

export const Colors = {
    white: '#ffffff',
    grey: '#c2c2c2',
    blue: '#3498db',
    dark: '#121212',
    lighterDark: '#1E1E1E',
    orange: '#FFA500'
}

const GlobalStyles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: Colors.dark,
    },
    bodyWrapper: {
        paddingRight: 15,
        paddingLeft: 20,
        paddingVertical: 25,
        flex: 1,
        backgroundColor: Colors.dark,
    },
    simpleText: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.white,
    },
    smallText: {
        fontSize: 14,
        fontWeight: '400',
        color: Colors.white,
    },
    h3Text: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.white,
    },
    h1Text: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.white,
    },
    helperText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.grey,
        zIndex: 1
    },
    warning: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.orange,
    },
    blueButton: {
        paddingHorizontal: 25,
        paddingVertical: 13,
        borderRadius: 5,
        backgroundColor: Colors.blue,
        alignItems: 'center',
        justifyContent: "center"
    },
    grayButton: {
        paddingHorizontal: 25,
        paddingVertical: 13,
        borderRadius: 5,
        borderColor: Colors.white,
        borderWidth: 2,
        backgroundColor: Colors.lighterDark,
        alignItems: 'center',
        justifyContent: "center"
    },
    roundedAvatar: {
        width: 100,
        height: 100,
        borderRadius: 1000,
        borderWidth: 3,
        borderColor: Colors.orange,
    },
    textInput: {
        color: Colors.white,
        padding: 10,
        paddingLeft: 0,
        borderBottomColor: Colors.grey,
        borderBottomWidth: 1,
        fontSize: 20,
    },
    CardImage: {
        borderRadius: 5,
        maxWidth: Dimensions.get('window').width - 55,
        height: (Dimensions.get('window').width - 55) * 600 / 1050,
        backgroundColor: Colors.lighterDark,
        
    },
    QRImage: {
        width: '100%',
        height: 300,
    }
})

export default GlobalStyles;