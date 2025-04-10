import { View, Text, StyleSheet, Pressable, SafeAreaView, Linking, ScrollView } from "react-native";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckBox from '@react-native-community/checkbox';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { UserContext } from "../context/UserContext";
import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles";
//import GoogleAuth from "./googleAuth";
import LoginForm from "./forms/LoginForm";
import { apiHost } from "../../ApiConfig";


function LoginPage({ navigation }) {
    const [token, setToken, ] = useContext(UserContext);
    const { t } = useTranslation();
    const [agreement, setAgreement] = useState(true);

    async function onLogin(email, password) {

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password
            }),
        };

        const response = await fetch(`${apiHost}/api/users/token`, requestOptions);
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status == 401) {
                return t('invalid-credentials');
            } else if (response.status == 402) {
                return t('User email is not confirmed');
            }
        } else {
            setToken(data.access_token);
            navigation.navigate('ProfilePage')
            return null;
        }

    }

    return (
        <SafeAreaView style={GlobalStyles.area}>
            <ScrollView style={GlobalStyles.bodyWrapper}>
                <View>
                    <Text style={[GlobalStyles.h1Text, styles.headerText]}>{t("sign-in")}</Text>
                    
                    {agreement && <View>
                        <LoginForm onLogin={onLogin} />
                        <View style={{paddingBottom: 50}}>
                            <Pressable style={[GlobalStyles.grayButton, {marginBottom: 15, flexDirection: 'row'}]} onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text style={GlobalStyles.simpleText}>{t("forgot-password")}</Text>
                                <MaterialIcons name="password" size={24} color={Colors.white} style={{marginLeft: 6}} />
                            </Pressable>

                            {/*<GoogleAuth navigation={navigation}/>*/}

                            <Pressable style={[GlobalStyles.blueButton, {flexDirection: 'row'}]} onPress={() => navigation.navigate('RegisterForm')}>
                                <Text style={GlobalStyles.simpleText}>{t("create-account")}</Text>
                                <MaterialCommunityIcons name="account" size={24} color={Colors.white} style={{marginLeft: 6}} />
                            </Pressable>

                            <Pressable style={[GlobalStyles.blueButton, {marginTop: 10, flexDirection: 'row'}]} onPress={() => navigation.navigate('ConfirmEmail')}>
                                <Text style={GlobalStyles.simpleText}>{t("Confirm email")}</Text>
                                <MaterialIcons name="email" size={24} color={Colors.white} style={{marginLeft: 6}} />
                            </Pressable>

                            <Pressable style={[GlobalStyles.grayButton, {marginTop: 10, flexDirection: 'row'}]} onPress={() => navigation.navigate('ChooseLanguage')}>
                                <Text style={GlobalStyles.simpleText}>{t("choose-language")}</Text>
                                <Ionicons name="language" size={24} color={Colors.white} style={{marginLeft: 6}} />
                            </Pressable>
                            
                        </View>
                    </View>}
                    <View style={styles.ageementContainer}>
                        <CheckBox value={agreement} onValueChange={setAgreement} />
                        <Text style={GlobalStyles.simpleText}>{t('i-agree-with')} <Text style={{ color: Colors.blue }} onPress={() => { Linking.openURL(`${apiHost}/privacy_policy`) }}>{t('privacy-policy')}</Text></Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default LoginPage;

const styles = StyleSheet.create({
    headerText: {
        textAlign: 'center',
        marginVertical: 40
    },
    elementsMargin: {
        marginTop: 10,
    },
    ageementContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 10
    }
})