import { forwardRef, useImperativeHandle, useState } from "react";
import { Text, View, TextInput, StyleSheet } from "react-native"
import { useTranslation } from 'react-i18next';

import GlobalStyles from "../../../../globalStyles/GlobalStyles";
import { Colors } from "../../../../globalStyles/GlobalStyles";

const SecondStep = forwardRef(({userFormData, globalWarningState, setUserFormData, wrapperStyle}, ref) => {
    const {t} = useTranslation();

    const [warning, setWarning] = useState("");

    function isValid() {
        if (!userFormData.username) {
            setWarning(t('username-cant-be-empty'));
        } else if (userFormData.username.length > 100) {
            setWarning(t('username-can-contain-from-1-to-100-letters'));
        } else {
            return true;
        }
    }

    useImperativeHandle(ref, () => ({
        isValid, 
    }));


    const setUsername = (newText) => {
        globalWarningState[1]('');

        setUserFormData({
            ...userFormData,
            username: newText,
        });
    }
    const setFullName = (newText) => {
        setUserFormData({
            ...userFormData,
            fullName: newText,
        });
    }
    
    return (
        <View style={wrapperStyle}>
            <TextInput style={GlobalStyles.textInput} placeholder={t('username')} placeholderTextColor={Colors.white} defaultValue={userFormData.username} onChangeText={setUsername}/>
            <Text style={[GlobalStyles.helperText, styles.helperLabel]}>{t('enter-your-username-1-100-letters')}</Text>
            <Text style={[GlobalStyles.warning, styles.helperLabel]}>{warning}</Text>
            <Text style={[GlobalStyles.warning, styles.helperLabel]}>{globalWarningState[0]}</Text>

            <TextInput style={[GlobalStyles.textInput, {marginTop: 6}]} placeholder={t('full-name')} placeholderTextColor={Colors.white} defaultValue={userFormData.fullName} onChangeText={setFullName}/>
            <Text style={[GlobalStyles.helperText, styles.helperLabel]}>{t('enter-your-full-name-optional')}</Text>
        </View>
    )
});

export default SecondStep;

const styles = StyleSheet.create({
    helperLabel: {
        marginTop: 10
    }
})