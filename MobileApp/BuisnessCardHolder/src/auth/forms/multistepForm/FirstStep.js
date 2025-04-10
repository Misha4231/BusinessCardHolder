import { forwardRef, useImperativeHandle, useState } from "react";
import { Text, View, TextInput, StyleSheet } from "react-native"
import { useTranslation } from 'react-i18next';

import GlobalStyles from "../../../../globalStyles/GlobalStyles";
import { Colors } from "../../../../globalStyles/GlobalStyles";

const FirstStep = forwardRef(({userFormData, globalWarningState, setUserFormData, wrapperStyle}, ref) => {
    const {t} = useTranslation();

    const [warning, setWarning] = useState("");

    function isValid() {

        if (!userFormData.email) {
            setWarning(t('email-field-cant-be-empty'));
        } else if (!userFormData.email.includes('@')) {
            setWarning(t('email-should-contain-A'));
        } else {
            return true;
        }
    }

    useImperativeHandle(ref, () => ({
        isValid, 
    }));


    const setValue = (newText) => {
        globalWarningState[1]('');

        setUserFormData({
            ...userFormData,
            email: newText,
        });
    }
    
    return (
        <View style={wrapperStyle}>
            <TextInput style={GlobalStyles.textInput} placeholder={t('email')} placeholderTextColor={Colors.white} defaultValue={userFormData.email} onChangeText={setValue}/>

            <Text style={[GlobalStyles.helperText, styles.helperLabel]}>{t('enter-your-email')}</Text>
            <Text style={[GlobalStyles.warning, styles.helperLabel]}>{warning}</Text>
            <Text style={[GlobalStyles.warning, styles.helperLabel]}>{globalWarningState[0]}</Text>
        </View>
    )
});

export default FirstStep;

const styles = StyleSheet.create({
    helperLabel: {
        marginTop: 10
    }
})