import { View, StyleSheet } from "react-native";
import { useContext, useRef, useState } from "react";

import { UserContext } from "../context/UserContext";
import { apiHost } from "../../ApiConfig";
import StepsManager from "./forms/multistepForm/StepsManager"
import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles";
import EmailConfirmation from "./EmailConfirmation";

function RegisterForm({ navigation }) {
    const [, setToken] = useContext(UserContext);
    const [confirmationCode, setConfirmationCode] = useState(null);
    const [userEmail, setUserEmail] = useState('');


    const submitRegistration = async (userData) => {
        const fetchRegister = async (userData) => {
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userData.email,
                    fullName: userData.fullName,
                    username: userData.username,
                    password: userData.password,
                    googleId: null,
                    bytesAvatar: userData.avatar
                })
            };
    
            const response = await fetch(`${apiHost}/api/users`, requestOptions);
            const data = await response.json();
    
            if (!response.ok) {
                return data.detail;
            } else {
                setConfirmationCode(data.confirmation_code);
                // redirects to email confirmation
                setUserEmail(userData.email);
    
                return null;
            }
        }
    
        try {
            const res = await fetchRegister(userData);
            return res;
        } catch (error) {
           
            console.error("Error during registration:", error);
            return null; 
        }
    };
    
    async function confirmEmailSuccess() {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: userEmail,
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
        <View style={[GlobalStyles.bodyWrapper, {justifyContent: 'center'}]}>
            {confirmationCode ?
                <EmailConfirmation confirmationCode={confirmationCode} confirmEmailSuccess={confirmEmailSuccess} /> :
                <StepsManager submitRegistration={submitRegistration} />
            }
        </View>
    )
}

export default RegisterForm;

const styles = StyleSheet.create({
    
});
