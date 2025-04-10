import { View, SafeAreaView, StyleSheet, Text, Pressable, Image } from "react-native"
import { useContext } from "react";
import { AntDesign } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { UserContext } from "../context/UserContext";
import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles";
import { apiHost } from "../../ApiConfig";
import { getValidAvatarUri } from "../../components/ImagePicker";


const MyProfile = ({ navigation }) => {
    const {t} = useTranslation();

    const [, setToken,userData,] = useContext(UserContext);

    function onEdit() {
        navigation.navigate('EditProfile');
    }
    
    function Logout() {
        setToken(null);
        navigation.navigate('Home');
    }

    return userData ? (
        <SafeAreaView style={GlobalStyles.area}>
            <View style={[GlobalStyles.bodyWrapper]}>
                
                <View style={styles.headerContainer}>
                    <Text style={[GlobalStyles.h1Text, {maxWidth: '70%'}]}>{userData.fullName}</Text>

                    <Pressable onPress={onEdit}>
                        <AntDesign name="edit" size={24} color={Colors.white} />
                    </Pressable>
                </View>

                <View style={styles.profileAvatarContainer}>
                    <Image style={[GlobalStyles.roundedAvatar, {width: 150, height: 150}]} source={{uri: getValidAvatarUri(userData.avatar)}}/>
                </View>

                <Pressable style={[GlobalStyles.grayButton, {marginTop: 25}]} onPress={Logout}>
                    <Text style={GlobalStyles.simpleText}>{t('logout')}</Text>
                </Pressable>

                {/* ====================== Buisness cards list======================= */}

                <Pressable style={[GlobalStyles.blueButton]} onPress={() => {navigation.navigate('CreateCard')}}>
                    <Text style={GlobalStyles.simpleText}>{t("add-buisness-card")}</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    ) : null;
}

export default MyProfile;

const styles = StyleSheet.create({
    headerContainer: {
        paddingBottom: 5,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    profileAvatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 35
    }
})
