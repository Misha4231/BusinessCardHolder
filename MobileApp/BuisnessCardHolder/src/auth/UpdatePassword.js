import { View, StyleSheet, Pressable, TextInput, Text } from "react-native"
import { AntDesign } from '@expo/vector-icons';
import { useContext, useState } from "react";
import { useTranslation } from 'react-i18next';

import { Colors } from "../../globalStyles/GlobalStyles"
import GlobalStyles from "../../globalStyles/GlobalStyles";
import { apiHost } from "../../ApiConfig";
import { UserContext } from "../context/UserContext";


export default function UpdatePassword({ setModalVisibility }) {
    const {t} = useTranslation();

    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [warning, setWarning] = useState('');
    const [token, setToken,,] = useContext(UserContext);

    async function onSubmit() {
        if (!newPassword) {
            setWarning(t('new-password-cant-be-empty'));
            return;
        }
        if (!passwordConfirmation) {
            setWarning(t("password-confirmation-cant-be-empty"));
            return;
        }
        if (newPassword.length < 6 || newPassword.length > 250) {
            setWarning(t('password-may-contain-from-6-to-250-symbols'));
            return;
        }
        if (newPassword != passwordConfirmation) {
            setWarning(t("passwords-dont-match"));
            return;
        }

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                password: newPassword,
                
            })
        };

        const response = await fetch(`${apiHost}/api/users/update_password`, requestOptions);
        const data = await response.json();

        if (response.ok) {
            setToken(data.access_token);

            setModalVisibility(false);
        }
    }

    return (
        <View style={styles.modalWrapper}>
            <View style={styles.container}>
                <Pressable style={{alignSelf: 'flex-end', marginTop: 7, marginRight: 7}} onPress={() => {setModalVisibility(false)}}>
                    <AntDesign name="closecircle" size={24} color={Colors.orange} />
                </Pressable>
            
                <View style={{padding: 15, flex: 1}}>
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

                    <Text style={[GlobalStyles.warning, {marginTop: 10, maringBottom: 15}]}>{warning}</Text>

                    <Pressable style={[GlobalStyles.blueButton, {marginTop: 20, justifyContent: 'flex-end'}]} onPress={onSubmit}>
                        <Text style={GlobalStyles.simpleText}>{t('update-password')}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    modalWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: Colors.lighterDark,
        borderColor: Colors.orange,
        borderWidth: 1.5,
        alignSelf: 'center',
        width: 300,
        height: 400,
        borderRadius: 10,
        padding: 5
    },

});