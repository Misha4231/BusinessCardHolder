import { SafeAreaView, ScrollView, TextInput, View, Text, Pressable } from "react-native";
import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";

import { UserContext } from "../context/UserContext";
import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles";
import { apiHost } from "../../ApiConfig";
import EmailConfirmation from "./EmailConfirmation";

export default function ConfirmEmailPage({ navigation }) {
    const { t } = useTranslation();

    const [, setToken] = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState(null);
    const [warning, setWarning] = useState('');

    async function sendConfirmationCode() {
        setWarning('');

        if (!email || loading) return;

        setLoading(true);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
            })
        };

        const response = await fetch(`${apiHost}/api/users/send_confirmation_code`, options);
        const data = await response.json();
        console.log(response);
        
        if (!response.ok && response.status == 404) {
            setWarning(t("User with that email address not exists"));
        } else {
            setConfirmationCode(data.confirmation_code);
        }

        setLoading(false);
    }

    async function activateProfile() {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
            })
        };
        
        const response = await fetch(`${apiHost}/api/users/activate_profile`, requestOptions);
        const data = await response.json();
    
        if (!response.ok) {
            console.log("confirmation error");
        } else {
            setToken(data.access_token);
            navigation.navigate('Home');
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.area}>
            <ScrollView style={GlobalStyles.bodyWrapper}>

                {!confirmationCode ? <View>
                    <Text style={[GlobalStyles.h1Text, {marginBottom: 50, textAlign: 'center'}]}>{t('Enter your email address to receive a confirmation code')}:</Text>

                    <TextInput style={[GlobalStyles.textInput, { marginBottom: 10 }]} placeholder={t('email')} placeholderTextColor={Colors.white} defaultValue={email} onChangeText={(val) => { setEmail(val); setWarning(''); }} /> 
                    <Text style={GlobalStyles.warning}>{warning}</Text>
                    
                    <Pressable style={[GlobalStyles.blueButton, {marginTop: 20}]} onPress={sendConfirmationCode}>
                        <Text style={GlobalStyles.simpleText}>{t('Send confirmation code')}</Text>
                    </Pressable>
                </View> : <View>
                    <EmailConfirmation confirmationCode={confirmationCode} confirmEmailSuccess={activateProfile}/>
                </View>}
                
            </ScrollView>
        </SafeAreaView>
    )
}