import { useCallback, useContext, useEffect, useState } from "react";
import { View, SafeAreaView, ScrollView, Image, Pressable, Text, Linking } from "react-native";
import { EvilIcons, Feather, Fontisto, Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import { FontAwesome } from '@expo/vector-icons';

import GlobalStyles, { Colors } from "../globalStyles/GlobalStyles";
import { getValidAvatarUri } from "./ImagePicker";
import { UserContext } from "../src/context/UserContext";
import { apiHost } from "../ApiConfig";
import SaveCardButton from "./SaveCardButton";
import TemplateDisplay from "./CardTemplate/TemplateDisplay";

export default function CardDetail({ route, navigation }) {
    const [cardId, setCardIds] = useState(route.params.cardId);
    const [cardData, setCardData] = useState(null);
    const {t} = useTranslation();
    const [token,,currUserData,] = useContext(UserContext);
    const [linkCopied, setLinkCopied] = useState(false);
    const logo = require('../assets/icon.png');

    const deeplink = `buisnesscardholder://card/${cardId}`;
    const weblink = `${apiHost}/card?cardId=${cardId}`;

    useFocusEffect(useCallback(() => {
        async function fetchCardData() {
            const response = await fetch(`${apiHost}/api/cards/get_card_data?card_id=${cardId}`)
            const data = await response.json();
            
            setCardData(data);
        }

        fetchCardData();
        setLinkCopied(false);
    }, []))

    useEffect(() => {
        if (!token) {
            navigation.navigate('LoginPage');
        } else {
            navigation.navigate('Home');
            
        }
    }, [token])
    

    return (
        <SafeAreaView style={GlobalStyles.area}>
            <ScrollView style={[GlobalStyles.bodyWrapper]}>
                {(cardData && (cardData.ownerRelation.id == currUserData?.id || cardData.visibility == 1 || cardData.visibility == 0)) ? <View>
                    {cardData.visibility == -2 && <Text style={GlobalStyles.warning}>{t('WARING-buisness-card-is-banned')}</Text>}

                    <View>
                        {cardData.image ? 
                            <Image style={[GlobalStyles.CardImage]} source={{ uri: getValidAvatarUri(cardData.image) }} resizeMode='contain' /> :
                            <TemplateDisplay template={cardData.templateJson} cardData={cardData}/>
                        }
                    </View>

                    <Text style={[GlobalStyles.h3Text, {marginVertical: 15}]}>{cardData.categotyRelation?.title}</Text>
                    
                    <Pressable style={{flexDirection: 'row', marginBottom: 20}} onPress={() => {
                        const routeName =
                        cardData.ownerRelation.id != currUserData.id ? 'Search' : 'ProfilePage';
                
                        const screenParams =
                        cardData.ownerRelation.id != currUserData.id
                        ? {
                            screen: 'SearchOtherProfile',
                            params: cardData.ownerRelation,
                            }
                        : {
                            screen: 'Profile',
                            params: cardData.ownerRelation,
                            };
                
                        navigation.navigate(routeName, screenParams);
                    }}>
                        <Image style={[GlobalStyles.roundedAvatar, {width: 50, height: 50, marginRight: 20}]} source={{uri: getValidAvatarUri(cardData.ownerRelation.avatar)}}/>
                        <View>
                            <Text style={[GlobalStyles.h3Text, {marginBottom: 5}]}>{cardData.ownerRelation.fullName}</Text>
                            {cardData.ownerRelation.username && <Text style={[GlobalStyles.simpleText]}>@{cardData.ownerRelation.username}</Text>}
                        </View>
                    </Pressable>

                    {/* cardData.globalCategotyRelation && <View style={{flexDirection: 'row', marginBottom: 15}}>
                        <MaterialIcons name="category" size={24} color={Colors.white} />
                        <Text style={[GlobalStyles.h3Text, {marginTop: 3, marginLeft: 8}]}>{cardData.globalCategotyRelation.title}</Text>
                    </View> */}

                    {cardData.cityRelation && <View style={{flexDirection: 'row', marginBottom: 15}}>
                        <EvilIcons name="location" size={24} color={Colors.white} />
                        <Text style={[GlobalStyles.h3Text, {marginTop: 3, marginLeft: 8}]}>{cardData.cityRelation.title}</Text>
                    </View>}

                    {cardData.contact_number && <View style={{flexDirection: 'row', marginBottom: 15}}>
                        <Feather name="phone" size={24} color={Colors.white} />
                        <Text style={[GlobalStyles.h3Text, {marginTop: 5, marginLeft: 8}]}>{cardData.contact_number}</Text>
                    </View>}

                    {cardData.contact_email && <View style={{flexDirection: 'row', marginBottom: 15}}>
                        <Fontisto name="email" size={24} color={Colors.white} />
                        <Text style={[GlobalStyles.h3Text, {marginTop: 5, marginLeft: 8}]}>{cardData.contact_email}</Text>
                    </View>}

                    {cardData.contactLinksRelation && <View style={{marginBottom: 10}}>
                        {cardData.contactLinksRelation.map((contactLink, idx) => {
                                return (
                                    <View key={idx} style={{flexDirection: 'row', width: '100%'}}>
                                        <Entypo name="link" size={20} color={Colors.white} />
                                        <Text style={[GlobalStyles.simpleText, {marginTop: 5, marginLeft: 7}]}>{contactLink.title} - <Text style={{color: Colors.blue}} onPress={() => Linking.openURL(contactLink.link)}>{t('click-here')}</Text></Text>
                                    </View>
                                )
                            })}
                    </View>}

                    {cardData.description && <Text style={[GlobalStyles.simpleText, {marginVertical: 10}]}>{cardData.description}</Text>}
                    <SaveCardButton cardData={cardData}/>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                        <FontAwesome name="share" size={20} color={Colors.white} style={{ marginRight: 10 }} />
                        <Text style={GlobalStyles.simpleText}>{t('share-buisness-card')}</Text>
                    </View>

                    <View style={[GlobalStyles.QRImage, {justifyContent: 'center', alignItems: 'center', height: 200}]}>
                        <QRCode
                            value={deeplink}
                            logo={logo}
                            logoSize={50}
                            logoMargin={100}
                            color={Colors.orange}
                            backgroundColor={Colors.dark}
                            size={200}
                        />
                    </View>
                    <Text style={[GlobalStyles.helperText, {marginVertical: 10}]}>{t('share-qr-code-with-people-that-have-installed-bcard-app')}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.white }}>
                        <View style={{flexDirection: 'row', alignItems: "center", justifyContent: 'center'}}>
                            <FontAwesome name="link" size={24} color={Colors.white} style={{marginLeft: 10}} />
                            <Text style={[GlobalStyles.simpleText, {padding: 10}]}>{weblink.substring(0, 25)}...</Text>
                        </View>
                        
                        <Pressable onPress={() => { Clipboard.setString(weblink); setLinkCopied(true) }} style={{ borderLeftWidth: 1, borderLeftColor: 'white', padding: 10 }} >
                            {linkCopied && <Ionicons name="checkmark-outline" size={24} color={Colors.white} />}
                            {!linkCopied && <Feather name="copy" size={24} color={Colors.white}/>}
                        </Pressable>
                    </View>
                    <Text style={[GlobalStyles.helperText, {marginVertical: 10}]}>{t('share-url-with-everyone')}</Text>
                    
                </View> : <View>
                    <Text style={GlobalStyles.simpleText}>{t('Buisness-card-is-not-public')}</Text>
                </View>}
                <Text style={{paddingBottom: 100}}></Text>

            </ScrollView>
        </SafeAreaView>
    )
}

