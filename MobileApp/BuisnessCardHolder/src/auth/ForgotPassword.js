import { Text, SafeAreaView, View, TextInput, Pressable } from "react-native";
import { useState, useContext } from "react";
import { useTranslation } from 'react-i18next';

import { UserContext } from "../context/UserContext";
import GlobalStyles from "../../globalStyles/GlobalStyles";
import { Colors } from "../../globalStyles/GlobalStyles";
import { apiHost } from "../../ApiConfig";

export default function ForgotPassword({ navigation }) {
    const {t} = useTranslation();

    const [email, setEmail] = useState('');

    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [confirmationCode, setConfirmationCode] = useState('');
    const [realConfirmationCode, setRealConfirmationCode] = useState(null);

    const [warning, setWarning] = useState('');
    
    const [token, setToken,,] = useContext(UserContext);
    const [step, setStep] = useState(1);

    async function sendConfirmation() {
        if (!email) {
            setWarning(t('email-or-username-field-cant-be-empty'))
            return;
        }

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email
            })
        };

        const response = await fetch(`${apiHost}/api/users/forgot_password`, requestOptions);
        const data = await response.json();

        if (response.ok) {
            setRealConfirmationCode(data.confirmation_code);
            setStep(2);
        } else {
            if (data.detail == 'User has signed with google') {
                setWarning(t('user-has-signed-with-google'));
            } else if (data.detail == 'User not exists') {
                setWarning(t('user-not-exists'));
            } else {
                setWarning(t('unknown-error'));
            }
        }
    }

    function onConfirm() {
        if (confirmationCode != realConfirmationCode) {
            setWarning(t('confirmation-codes-dont-match'));
            return;
        }

        setStep(3);
    }

    async function onUpdatePassword() {
        if (!newPassword) {
            setWarning(t("new-password-cant-be-empty"));
            return;
        }
        if (!passwordConfirmation) {
            setWarning(t('password-confirmation-cant-be-empty'));
            return;
        }
        if (newPassword.length < 6 || newPassword.length > 250) {
            setWarning(t('password-may-contain-from-6-to-250-symbols'));
            return;
        }
        if (newPassword != passwordConfirmation) {
            setWarning(t('passwords-dont-match'));
            return;
        }

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: newPassword
            })
        };

        const response = await fetch(`${apiHost}/api/users/update_forgotten_password`, requestOptions);
        const data = await response.json();

        if (response.ok) {
            setTimeout(() => {navigation.navigate('LoginPage')}, 200);
        } else {
            if (data.detail == 'User not exists') {
                setWarning(t('user-not-exists'));
            } else {
                setWarning(t('unknown-error'));
            }
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.area}>
            <View style={[GlobalStyles.bodyWrapper]}>
                <Text style={[GlobalStyles.h1Text, {alignSelf: 'center', marginTop: 25, marginBottom: 100}]}>{t('forgot-password')}</Text>
                
                {step == 1 && <View>
                    <TextInput style={GlobalStyles.textInput} placeholder={t("email-or-username")} placeholderTextColor={Colors.white} defaultValue={email} onChangeText={(newValue) => {
                        setWarning('');
                        setEmail(newValue);
                    }}/>
                    <Text style={[GlobalStyles.helperText, {marginTop: 10, paddingBottom: 100}]}>{t('enter-your-email-or-username')}</Text>

                    <Pressable style={[GlobalStyles.blueButton]} onPress={sendConfirmation}>
                        <Text style={GlobalStyles.simpleText}>{t('update-password')}</Text>
                    </Pressable>
                </View>}

                {step == 2 && <View>
                    <TextInput style={GlobalStyles.textInput} placeholder={t('confirmation-code')} placeholderTextColor={Colors.white} defaultValue={confirmationCode} onChangeText={(newValue) => {
                        setWarning('');
                        setConfirmationCode(newValue);
                    }}/>
                    <Text style={[GlobalStyles.helperText, {marginTop: 10, paddingBottom: 100}]}>{t('you-have-received-6-digit-confirmation-code-to-your-new-email-address-enter-that-code-here')}</Text>

                    <Pressable style={[GlobalStyles.blueButton]} onPress={onConfirm}>
                        <Text style={GlobalStyles.simpleText}>{t('confirm')}</Text>
                    </Pressable>
                </View>}

                {step == 3 && <View>
                    <TextInput secureTextEntry={true} style={GlobalStyles.textInput} placeholder={t('new-password')} placeholderTextColor={Colors.white} defaultValue={newPassword} onChangeText={(newValue) => {
                        setWarning('');
                        setNewPassword(newValue);
                    }}/>
                    <Text style={[GlobalStyles.helperText, {marginTop: 10, paddingBottom: 45}]}>{t('enter-new-password-6-250 symbols')}</Text>

                    <TextInput secureTextEntry={true} style={[GlobalStyles.textInput]} placeholder={t('new-password-confirmation')} placeholderTextColor={Colors.white} defaultValue={passwordConfirmation} onChangeText={(newValue) => {
                        setWarning('');
                        setPasswordConfirmation(newValue);
                    }}/>
                    <Text style={[GlobalStyles.helperText, {marginTop: 10, maringBottom: 25}]}>{t('repeat-new-password')}</Text>

                    

                    <Pressable style={[GlobalStyles.blueButton, {marginTop: 20, justifyContent: 'flex-end'}]} onPress={onUpdatePassword}>
                        <Text style={GlobalStyles.simpleText}>{t('update-password')}</Text>
                    </Pressable>
                </View>}
                
                <Text style={[GlobalStyles.warning, {marginTop: 25}]}>{warning}</Text>
            </View>
        </SafeAreaView>
    )
}