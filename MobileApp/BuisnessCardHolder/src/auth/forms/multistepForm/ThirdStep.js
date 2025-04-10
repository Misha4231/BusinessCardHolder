import { forwardRef, useImperativeHandle, useState } from "react";
import { Text, View, TextInput, StyleSheet } from "react-native"
import { useTranslation } from 'react-i18next';

import GlobalStyles from "../../../../globalStyles/GlobalStyles";
import { Colors } from "../../../../globalStyles/GlobalStyles";

const ThirdStep = forwardRef(({userFormData, setUserFormData, wrapperStyle}, ref) => {
    const {t} = useTranslation();

    const [warning, setWarning] = useState("");

    function isValid() {
        
        if (!userFormData.password) {
            setWarning(t('password-cant-be-empty'));
        } else if (!userFormData.passwordConfirmation) {
            setWarning(t('confirm-your-password'));
        } else if (userFormData.password.length > 250 || userFormData.password.length < 6) {
            setWarning(t('password-can-contain-from-6-to-250-symbols'));
        } else if (userFormData.passwordConfirmation != userFormData.password) {
            setWarning(t('passwords-dont-match'));
        } else {
            return true;
        }
    }

    useImperativeHandle(ref, () => ({
        isValid, 
    }));


    const setPassword = (newText) => {
        setUserFormData({
            ...userFormData,
            password: newText,
        });
    }
    const setPasswordConfirmation = (newText) => {
        setUserFormData({
            ...userFormData,
            passwordConfirmation: newText,
        });
    }
    
    return (
        <View style={wrapperStyle}>
            <TextInput secureTextEntry={true} style={GlobalStyles.textInput} placeholder={t('password')} placeholderTextColor={Colors.white} defaultValue={userFormData.password} onChangeText={setPassword}/>
            <Text style={[GlobalStyles.helperText, styles.helperLabel]}>{t('enter-new-password-6-250 symbols')}</Text>

            <TextInput secureTextEntry={true} style={[GlobalStyles.textInput, {marginTop: 6}]} placeholder={t('password-confirmation')} placeholderTextColor={Colors.white} defaultValue={userFormData.passwordConfirmation} onChangeText={setPasswordConfirmation}/>
            <Text style={[GlobalStyles.helperText, styles.helperLabel]}>{t('repeat-password')}</Text>

            <Text style={[GlobalStyles.warning, styles.helperLabel]}>{warning}</Text>
        </View>
    )
});

export default ThirdStep;

const styles = StyleSheet.create({
    helperLabel: {
        marginTop: 10
    }
})