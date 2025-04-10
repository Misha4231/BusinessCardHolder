import { View, SafeAreaView, StyleSheet, Text, Pressable, Image, TextInput, Modal, ScrollView } from "react-native"
import { useContext, useState } from "react";
import { useTranslation } from 'react-i18next';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';

import { UserContext } from "../context/UserContext";
import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles";
import OpenImagePicker, { getValidAvatarUri } from "../../components/ImagePicker";
import { apiHost } from "../../ApiConfig";
import UpdatePassword from "../auth/UpdatePassword";

const EditProfile = ({ navigation }) => {
    const {t} = useTranslation();

    const [, setToken, userData,] = useContext(UserContext);
    const [newUserData, setNewUserData] = useState(userData);
    const [warning, setWarning] = useState('');
    const [emailConfirmationCode, setEmailConfirmationCode] = useState('');
    const [inputEmailConfirmationCode, setInputEmailConfirmationCode] = useState('');
    const [updatePasswordModalVisible, setUpdatePasswordModalVisible] = useState(false);

    function setEmail(newEmail) {
        setWarning('');

        setNewUserData({
            ...newUserData,
            email: newEmail
        });
    }
    function setUsername(newUsername) {
        setWarning('');
        if (!newUsername) newUsername = null;

        setNewUserData({
            ...newUserData,
            username: newUsername
        });
    }
    function setFullName(newFullName) {
        setWarning('');

        setNewUserData({
            ...newUserData,
            fullName: newFullName
        });
    }
    function setAvatar(b64avatar) {
        setNewUserData({
            ...newUserData,
            avatar: b64avatar
        });
    }

    async function fetchUserUpdate(userData) {
        if (!userData.email) {
            setWarning(t("email-field-cant-be-empty"));
            return;
        }

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        };

        const response = await fetch(`${apiHost}/api/users/update`, requestOptions);
        return response;
    }

    async function onSubmitUpdate() {

        const response = await fetchUserUpdate({...newUserData, forceEmail: false});
        const data = await response.json();

        if (!response.ok) {
            if (data.detail == "User not exists") {
                setWarning(t('user-not-exists'));
            } else if (data.detail == "User with that username aready exists") {
                setWarning(t('user-with-that-username-aready-exists'));
            } else if (data.detail == "User with that email aready exists") {
                setWarning(t('user-with-that-email-aready-exists'));
            } else {
                setWarning(t('unknown-error'));
            }
            
        } else {
            if (newUserData.email != userData.email) {
                // confirm new email
                setEmailConfirmationCode(data.confirmation_code)
            } else {
                setToken(data.access_token);
                navigation.navigate('Profile');
            }
        }
    }

    async function onConfirmEmail() {
        if (emailConfirmationCode.confirmation_code != inputEmailConfirmationCode) {
            setWarning(t('invalid-confirmation-code'));
            return;
        }

        const response = await fetchUserUpdate({...newUserData, forceEmail: true});
        const data = await response.json();

        if (!response.ok) {
            if (data.detail == "User not exists") {
                setWarning(t('user-not-exists'));
            } else if (data.detail == "User with that username aready exists") {
                setWarning(t('user-with-that-username-aready-exists'));
            } else if (data.detail == "User with that email aready exists") {
                setWarning(t('user-with-that-email-aready-exists'));
            } else {
                setWarning(t('unknown-error'));
            }
        } else {
            setToken(data.access_token);
            navigation.navigate('Profile');
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.area}>
            <View style={[GlobalStyles.bodyWrapper]}>
                <ScrollView>
                    <View style={styles.avatarContainer}>
                        <Image style={[GlobalStyles.roundedAvatar, {marginBottom: 30}]} source={{uri: getValidAvatarUri(newUserData.avatar)}} resizeMode="contain"/>

                        <Pressable style={GlobalStyles.grayButton} onPress={() => {OpenImagePicker(setAvatar)}}>
                            <Text style={GlobalStyles.simpleText}>{t('set-new-avatar')}</Text>
                        </Pressable>
                    </View>

                    {!userData?.googleId && <TextInput defaultValue={newUserData.email} onChangeText={setEmail} style={[GlobalStyles.textInput]} placeholderTextColor={Colors.white}  placeholder={t('email')}/>}
                    {!userData?.googleId && <Text style={[GlobalStyles.helperText, {marginTop: 10, marginBottom: 15}]}>{t('enter-new-email')}</Text>}
                    
                    <TextInput defaultValue={newUserData.username} onChangeText={setUsername} style={[GlobalStyles.textInput]} placeholderTextColor={Colors.white} placeholder={t("username")}/>
                    <Text style={[GlobalStyles.helperText, {marginTop: 10, marginBottom: 15}]}>{t("enter-new-username")}</Text>

                    <TextInput defaultValue={newUserData.fullName} onChangeText={setFullName} style={[GlobalStyles.textInput]} placeholderTextColor={Colors.white} placeholder={t("full-name")}/>
                    <Text style={[GlobalStyles.helperText, {marginTop: 10, marginBottom: 15}]}>{t('enter-new-full-name')}</Text>

                    {emailConfirmationCode && <View>
                        <TextInput defaultValue={inputEmailConfirmationCode} onChangeText={(newConfCode) => {setInputEmailConfirmationCode(newConfCode)}} style={[GlobalStyles.textInput, {width: '50%'}]} placeholderTextColor={Colors.white} placeholder={t("confirmation-code")}/>
                        <Text style={[GlobalStyles.helperText, {marginTop: 10, marginBottom: 15}]}>{t('you-have-received-6-digit-confirmation-code-to-your-new-email-address-enter-that-code-here')}</Text>
                        
                        <Pressable style={[GlobalStyles.blueButton, {width: '50%'}]} onPress={onConfirmEmail}>
                            <Text style={GlobalStyles.smallText}>{t('confirm-new-email')}</Text>
                        </Pressable>
                    </View>}

                    <Text style={[GlobalStyles.warning, {marginTop: 15}]}>{warning}</Text>

                    <Pressable style={[GlobalStyles.blueButton, {flexDirection: 'row'}]} onPress={onSubmitUpdate}>
                        <Text style={GlobalStyles.simpleText}>{t("save")}</Text>
                        <AntDesign name="save" style={{marginLeft: 6}} size={24} color={Colors.white} />
                    </Pressable>


                    {!userData?.googleId && <View>
                        <Pressable style={[GlobalStyles.grayButton, {marginTop: 15, flexDirection: 'row'}]} onPress={() => {setUpdatePasswordModalVisible(true)}}>
                            <Text style={GlobalStyles.simpleText}>{t('update-password')}</Text>
                            <MaterialIcons name="password" style={{marginLeft: 6}} size={24} color={Colors.white} />
                        </Pressable>

                        <Modal animationType="slide" transparent={true} visible={updatePasswordModalVisible} onRequestClose={() => {setUpdatePasswordModalVisible(!updatePasswordModalVisible)}}>
                            <UpdatePassword setModalVisibility={setUpdatePasswordModalVisible} />
                        </Modal>
                    </View>}
                    
                    <Pressable style={[GlobalStyles.grayButton, {marginTop: 15, flexDirection: 'row'}]} onPress={() => {navigation.navigate('ChooseLanguage')}}>
                        <Text style={GlobalStyles.simpleText}>{t('choose-language')}</Text>
                        <Ionicons name="language" style={{marginLeft: 6}} size={24} color={Colors.white} />
                    </Pressable>

                    <Pressable style={[GlobalStyles.grayButton, {marginTop: 15, flexDirection: 'row'}]} onPress={() => {navigation.navigate('DeleteProfile')}}>
                        <Text style={GlobalStyles.simpleText}>{t('delete-profile')}</Text>
                        <AntDesign name="delete" size={24} style={{marginLeft: 6}} color={Colors.white} />
                    </Pressable>
                    
                    <Text style={{marginBottom: 100}}></Text>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default EditProfile;

const styles = StyleSheet.create({
    avatarContainer: {
        marginVertical: 25,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
