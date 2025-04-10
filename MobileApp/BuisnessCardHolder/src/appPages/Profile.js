import { View, SafeAreaView, StyleSheet, Text, Pressable, Image, ScrollView, Modal } from "react-native"
import { useCallback, useContext,useEffect,useState } from "react";
import { AntDesign } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';

import { UserContext } from "../context/UserContext";
import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles";
import { getValidAvatarUri } from "../../components/ImagePicker";
import CardsList from "../../components/CardsList";
import { useFocusEffect } from "@react-navigation/native";


const Profile = ({ route, navigation }) => {
    const {t} = useTranslation();

    var [token, setToken,contextUserData,] = useContext(UserContext);
    const [userData, setUserData] = useState();
    const [userCards, setUserCards] = useState([]);

    useEffect(() => {
        setUserCards([]);
        setUserData((route.params && (contextUserData && route.params.id != contextUserData.id)) ?
         {...route.params, otherUser: true} : {...contextUserData, otherUser: false});
        
    }, [contextUserData])

    useEffect(() => {
        if (!token) {
            navigation.navigate('LoginPage');
        }
    }, [token])

    function HeaderComponent() {
        return (
            <View style={{marginBottom: 10}}>
                <View style={styles.headerContainer}>
                    <Text style={[GlobalStyles.h1Text, {maxWidth: '70%'}]}>{userData.fullName}</Text>

                    {!userData.otherUser && <Pressable style={{padding: 20}} onPress={() => {
                        navigation.navigate('EditProfile');
                    }}>
                        <AntDesign name="edit" size={24} color={Colors.white} />
                    </Pressable>}
                </View>

                <View style={styles.profileAvatarContainer}>
                    <Image style={[GlobalStyles.roundedAvatar, {width: 150, height: 150}]} source={{uri: getValidAvatarUri(userData.avatar)}}/>
                </View>

                {!userData.otherUser && <Pressable style={[GlobalStyles.grayButton, {marginTop: 25, flexDirection: 'row'}]} onPress={Logout}>
                    <Text style={[GlobalStyles.simpleText, {marginRight: 10}]}>{t('logout')}</Text>
                    <Entypo name="log-out" size={20} color={Colors.white} />
                </Pressable>}

                {!userData.otherUser && <Pressable style={[GlobalStyles.blueButton, {marginVertical: 10, flexDirection: 'row'}]} onPress={() => {navigation.navigate('CreateCard', {setCards: setUserCards})}}>
                    <Text style={[GlobalStyles.simpleText, {marginRight: 10}]}>{t("add-buisness-card")}</Text>
                    <FontAwesome6 name="add" size={20} color={Colors.white} />
                </Pressable>}
            </View>
        )
    }

    function Logout() {
        setToken(null);
        navigation.navigate('Home');
    }

    return userData?.id ? (
        <SafeAreaView style={GlobalStyles.area}>
            <View style={[GlobalStyles.bodyWrapper]}>

                {!userData.isBanned ? <CardsList apiEndpoint={`/api/cards/current_user_cards?user_id=${userData.id}&`} navigation={navigation} cards={userCards} setCards={setUserCards} HeaderComponent={HeaderComponent}/>
                    :
                <View>
                    <Text style={[GlobalStyles.warning, {marginTop: 50}]}>{t('WARING-user-has-been-blocked')}</Text>
                    <Pressable style={[GlobalStyles.grayButton, {marginTop: 15}]} onPress={() => {navigation.navigate('DeleteProfile')}}>
                        <Text style={GlobalStyles.simpleText}>{t('delete-profile')}</Text>
                    </Pressable>    
                </View>
                }
            </View>
        </SafeAreaView>
    ) : null;
}

export default Profile;

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
        marginTop: 8
    }
})
