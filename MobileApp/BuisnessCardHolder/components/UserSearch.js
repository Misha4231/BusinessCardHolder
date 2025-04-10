import { View, TextInput, Pressable, Image, Text, FlatList } from "react-native";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { UserContext } from "../src/context/UserContext";
import GlobalStyles, {Colors} from "../globalStyles/GlobalStyles"
import { apiHost } from "../ApiConfig";
import { getValidAvatarUri } from "./ImagePicker";

function UserIcon({navigation, userData}) {
    return (
        <Pressable style={{flexDirection: 'row', marginBottom: 20}} onPress={() => {
            navigation.navigate('SearchOtherProfile', userData)
        }}>
            <Image style={[GlobalStyles.roundedAvatar, {width: 30, height: 30, marginRight: 20}]} source={{uri: getValidAvatarUri(userData.avatar)}}/>
            <View>
                <Text style={[GlobalStyles.h3Text, {marginBottom: 5}]}>{userData.fullName}</Text>
                <Text style={[GlobalStyles.simpleText]}>@{userData.username}</Text>
            </View>
        </Pressable>
    )
}

export default function UserSearch({ navigation }) {
    const { t } = useTranslation();

    var [token,,,] = useContext(UserContext);

    const [searchedUsers, setSearchedUsers] = useState([]);
    const [searchInput, setSearchInput] = useState('');

    async function onChange(newVal) {
        setSearchInput(newVal);

        if (searchInput) {
            const requestOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            };

            const response = await fetch(`${apiHost}/api/users/search?search_input=${searchInput}`, requestOptions);
            const data = await response.json();

            setSearchedUsers(data);
        }
    }

    return (
        <View>
            <TextInput defaultValue={searchInput} onChangeText={onChange} style={[GlobalStyles.textInput, {marginVertical: 20}]} placeholder={t("Search user by full name or username")} placeholderTextColor={Colors.white}/>
        
            <FlatList data={searchedUsers}
                renderItem={({item}) => <UserIcon navigation={navigation} userData={item}/>}
            />
        </View>
    )
}