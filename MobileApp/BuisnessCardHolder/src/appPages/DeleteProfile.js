import { View, SafeAreaView, ScrollView, Text, Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { useContext, useState } from "react";

import { apiHost } from "../../ApiConfig";
import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles"
import { UserContext } from "../context/UserContext";

export default function DeleteProfile({ navigation }) {
    const { t } = useTranslation();

    const [token, setToken, ,] = useContext(UserContext);
    const [errorMessage, setErrorMessage] = useState('');

    async function deleteCurrentUser() {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`
            },
        };

        const response = await fetch(`${apiHost}/api/users/delete_curr_profile`, requestOptions);

        if (response.ok) {
            setToken(null);
        
        } else {
            const msg = await response.text();
            setErrorMessage(msg)
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.area}>
            <View style={[GlobalStyles.bodyWrapper, {justifyContent: 'center'}]}>
                <ScrollView>
                    <Text style={[GlobalStyles.warning, {marginVertical: 50, textAlign: 'center', fontSize: 20}]}>{t('are-sure-that-you-want-to-delete-your-profile')}</Text>
                    
                    <Pressable style={[GlobalStyles.grayButton, {marginTop: 15}]} onPress={deleteCurrentUser}>
                        <Text style={GlobalStyles.simpleText}>{t('yes-delete')}</Text>
                    </Pressable>

                    <Pressable style={[GlobalStyles.blueButton, {marginTop: 15}]} onPress={() => {navigation.goBack()}}>
                        <Text style={GlobalStyles.simpleText}>{t('no-i-dont-want-to-delete-my-account')}</Text>
                    </Pressable>

                    <Text style={[GlobalStyles.helperText, { marginTop: 50 }]}>{t('note-that-all-your-business-cards-will-be-deleted-too')}</Text>
                    
                    <Text style={[GlobalStyles.warning, {marginTop: 20}]}>{errorMessage}</Text>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}