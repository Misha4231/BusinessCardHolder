import { forwardRef, useImperativeHandle } from "react";
import { Text, View, Button, StyleSheet, Image, Pressable } from "react-native"
import { useTranslation } from 'react-i18next';

import GlobalStyles from "../../../../globalStyles/GlobalStyles";
import OpenImagePicker from "../../../../components/ImagePicker";

const FourthStep = forwardRef(({userFormData, setUserFormData, wrapperStyle}, ref) => {
    const {t} = useTranslation();

    function isValid() {
        return true;
    }

    useImperativeHandle(ref, () => ({
        isValid, 
    }));


    const setAvatar = (b64avatar) => {
        setUserFormData({
            ...userFormData,
            avatar: b64avatar,
        });
    }

    
    return (
        <View style={styles.wrapperStyle}>
            <Image style={[GlobalStyles.roundedAvatar, {marginBottom: 30}]} source={{uri: userFormData.avatar}} resizeMode="contain"/>

            <Pressable style={GlobalStyles.grayButton} onPress={() => {OpenImagePicker(setAvatar)}}>
                <Text style={GlobalStyles.simpleText}>{t('choose-avatar')}</Text>
            </Pressable>
            <Text style={[GlobalStyles.helperText, styles.helperLabel]}>{t('set-your-avatar-optional')}</Text>
        </View>
    )
});

export default FourthStep;

const styles = StyleSheet.create({
    wrapperStyle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    helperLabel: {
        marginTop: 10
    }
})