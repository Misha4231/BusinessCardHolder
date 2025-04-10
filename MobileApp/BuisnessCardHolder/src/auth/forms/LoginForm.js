import { View, TextInput, Text, Pressable, StyleSheet } from "react-native"
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Entypo } from '@expo/vector-icons';

import GlobalStyles from "../../../globalStyles/GlobalStyles";
import { Colors } from "../../../globalStyles/GlobalStyles";

function LoginForm({ onLogin }) {
    const {t} = useTranslation();

    const [userEmail, setEmail] = useState('');
    const [userPassword, setPassword] = useState('');
    const [warning, setWarning] = useState('');

    async function onLoginSubmit() {
        if (!userEmail || !userPassword) {
            setWarning(t('fields-cant-be-empty'));
        } else {
            await onLogin(userEmail, userPassword).then((err) => {
                if (err) setWarning(err);
            });
        }
    }

    function setNewEmail(newEmail) {
        setEmail(newEmail);
        setWarning('')
    }
    
    function setNewPassword(newPassword) {
        setPassword(newPassword);
        setWarning('')
    }

    return (
        <View>
            <TextInput placeholder={t('email-or-username')} defaultValue={userEmail} onChangeText={setNewEmail} style={GlobalStyles.textInput} placeholderTextColor={Colors.white} />
            <Text style={[GlobalStyles.helperText, styles.elementsMargin]}>{t('enter-your-email-or-username-to-sign-in')}</Text>

            <TextInput secureTextEntry={true} placeholder={t('password')} defaultValue={userPassword} onChangeText={setNewPassword} style={[GlobalStyles.textInput, {marginTop: 30}]} placeholderTextColor={Colors.white}/>
            <Text style={[GlobalStyles.helperText, styles.elementsMargin]}>{t('enter-your-password')}</Text>
        
            <Pressable style={[GlobalStyles.grayButton, {marginTop: 40, flexDirection: 'row'}]} onPress={() => onLoginSubmit()}>
                <Text style={GlobalStyles.simpleText}>{t('sign-in')}</Text>
                <Entypo name="login" size={24} color={Colors.white} style={{marginLeft: 6}} />
            </Pressable>

            <Text style={[GlobalStyles.warning, styles.elementsMargin]}>{warning}</Text>
        </View>
    )
};

export default LoginForm;

const styles = StyleSheet.create({
    elementsMargin: {
        marginVertical: 10,
    }
})