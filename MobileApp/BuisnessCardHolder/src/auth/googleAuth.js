import { useState, useEffect, useContext } from "react";
import { Button, Text, View, Pressable } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google'
import { useTranslation } from 'react-i18next';
import { GoogleSignin, GoogleSigninButton, statusCodes } from "@react-native-google-signin/google-signin";


import { apiHost } from "../../ApiConfig";
import { UserContext } from "../context/UserContext";
import GlobalStyles from "../../globalStyles/GlobalStyles";

WebBrowser.maybeCompleteAuthSession();


function GoogleAuth({ navigation }) {
    const {t} = useTranslation();
    const [token, setToken] = useContext(UserContext);

    const configureGoogleSignIn = () => {
        GoogleSignin.configure({
            webClientId: '',
            androidClientId: '',
            iosClientId: '',
        });
    };

    useEffect(() => {
        configureGoogleSignIn();
    });

    const signIn = async () => {
        console.log('pressed');

        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        console.log(userInfo);

        

    };


    async function handleSignInWithGoogle() {
        if (response?.type === "success") {
            await getUserInfo(response.authentication.accessToken);
        }
    }

    const getUserInfo = async (token) => {
        if (!token) return;
        
        try {
            const response = await fetch(
                "https://www.googleapis.com/userinfo/v2/me",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const user = await response.json();

            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                    fullName: user.name,
                    username: null,
                    password: null,
                    googleId: user.id,
                    bytesAvatar: user.picture
                })
            };
            
            const userCreationResponse = await fetch(`${apiHost}/api/users`, requestOptions);
            const data = await userCreationResponse.json();
    
            if (userCreationResponse.ok) {
                setToken(data.access_token);

                setTimeout(() => {navigation.navigate('ProfilePage', { screen: 'EditProfile' });}, 200);
                
            }
           
        } catch (error) {
            console.log("Google auth error");
        }
    }
        
    return (
        <View>
            {/*<Pressable style={[GlobalStyles.blueButton, { marginBottom: 10 }]} onPress={() => promptAsync()}>
                <Text style={GlobalStyles.simpleText}>{t('sing-in-with-google')}</Text>
            </Pressable>*/}
            <GoogleSigninButton size={GoogleSigninButton.Size.Standard} color={GoogleSigninButton.Color.Dark} onPress={signIn} />
        </View>
    )
}

//export default GoogleAuth;