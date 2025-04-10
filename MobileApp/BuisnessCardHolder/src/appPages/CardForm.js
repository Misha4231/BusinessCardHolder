import { View, SafeAreaView, StyleSheet, Pressable, Text, TextInput, Image, ScrollView } from "react-native"
import { useContext, useEffect, useState } from "react"
import { Entypo, AntDesign, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { Linking } from "react-native";
import { useTranslation } from 'react-i18next';

import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles"
import OpenImagePicker from "../../components/ImagePicker"
import { getValidAvatarUri } from "../../components/ImagePicker"
import { apiHost } from "../../ApiConfig"
import CoosingInputList from "../../components/CoosingInputList"
import { UserContext } from "../context/UserContext"
import CreateFromTemplateButton from "../../components/CardTemplate/CreateFromTemplateButton"
import TemplateDisplay from "../../components/CardTemplate/TemplateDisplay";
import ChooseGlobalCategory from "../../components/GlobalCategories/ChooseGlobalCategory";
import CardImageInput from "../../components/Input/CardImageInput";

export default function CardForm({ route, navigation }) {
    const {t} = useTranslation();
    const [token,,,] = useContext(UserContext);

    const [cardData, setCardData] = useState(route.params.isExists ? route.params : {
        category_id: null,
        global_category_id: null,
        ownCategory: null,
        image: '',
        city_id: null,
        new_localization: null,
        contact_number: null,
        contact_email: null,
        contactLinksRelation: [],
        description: null,
        visibility: 0,
        isExists: false,
        templateJson: null
    });
    
    const [newLink, setNewLink] = useState({title: '', link: ''});
    const [warning, setWarning] = useState('');
    const visibilityOptions = [{ title: t('private'), key: -1 }, { title: t('QR-only'), key: 0 }, { title: t("public"), key: 1 }];
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (cardData.new_localization === undefined || cardData.new_localization?.length == 0) {
            setCardData({...cardData, new_localization: null})
        }
        if (cardData.ownCategory === undefined || cardData.ownCategory?.length == 0) {
            setCardData({...cardData, ownCategory: null})
        }
    }, [cardData])


    function setCardImage(b64Image) {
        setCardData({
            ...cardData,
            image: b64Image
        });
    }

    function setCategory(cat) {
        setCardData({
            ...cardData,
            category_id: (cat?.id == undefined ? null : cat.id),
            ownCategory: cat
        });
    }
    function setCityId(city) {   
        setCardData({
            ...cardData,
            city_id: (city?.id == undefined ? null : city.id),
            new_localization: city,
        });
    }
    function setGlobalCategoryId(id) {
        setCardData({
            ...cardData,
            global_category_id: id
        })
    }

    function setContactNumber(newVal) {
        setCardData({
            ...cardData,
            contact_number: newVal
        });
    }
    function setContactEmail(newVal) {
        setCardData({
            ...cardData,
            contact_email: newVal
        });

    }

    async function addCard() {
        if (loading) {
            return;
        }
        setLoading(true);
        
        if (!cardData.image && !cardData.templateJson) {
            setWarning(t('image-is-required')); setLoading(false);
            return;
        }
        if (cardData?.ownCategory?.length > 250) {
            setWarning(t("own-category-can-contain-0-250-symbols")); setLoading(false);
            return;
        }
        if (cardData?.new_localization?.length > 80) {
            setWarning(t("own-location-can-contain-0-80-sybmols")); setLoading(false);
            return;
        }
        if (cardData?.description?.length > 2000) {
            setWarning(t("description-can-contain-0-2000-symbols")); setLoading(false);
            return;
        }
        if (cardData?.contact_number?.length > 15) {
            setWarning(t('not-valid-contact-number')); setLoading(false);
            return;
        }
        if (cardData.contactLinksRelation.length > 10) {
            setWarning(t("number-of-links-cant-be-bigger-than-10")); setLoading(false);
            return;
        }
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`
            },
            body: JSON.stringify(cardData)
        };

        const requestApiEndpoint = cardData.isExists ? `${apiHost}/api/cards/update` : `${apiHost}/api/cards/create`;
        const response = await fetch(requestApiEndpoint, requestOptions)
        const newCardData = await response.json();

        if (cardData.isExists) {
            
            cardData.setCards((oldCards) => {
                const newCards = oldCards.map((card) => {
                    if (card.id === newCardData.id) {
                      return newCardData;
                    }
  
                    return card;
                });
                
                return newCards;
            })
        } else {
            route.params.setCards([]);
            
        }
        setLoading(false);
        
        if (response.ok && !loading) {
        
            navigation.navigate('Profile');
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.area}>
            <ScrollView style={GlobalStyles.bodyWrapper}>
                {cardData.visibility == -2 ? <Text style={GlobalStyles.warning}>{t('WARING-buisness-card-is-banned')}</Text> : 
                    <View style={styles.formContainer}>

                        <View style={{marginTop: 15}}></View>
                        <CoosingInputList initSearch={cardData?.categotyRelation?.title} setOutputData={setCategory} apiLink={`${apiHost}/api/cards/get_categories`} placeholderText={t('search-category')} />
                        <Text style={[GlobalStyles.helperText, {marginTop: 15,marginBottom: 25}]}>{t('find-your-category-or-writ-your-own-(optional)')}</Text>
                         
                        <ChooseGlobalCategory globalCategoryId={cardData.global_category_id} setGlobalCategoryId={setGlobalCategoryId}/>

                        <CoosingInputList initSearch={cardData?.cityRelation?.title} setOutputData={setCityId} apiLink={`${apiHost}/api/cards/get_cities`} placeholderText={t('search-localization')}/>
                        <Text style={[GlobalStyles.helperText, {marginTop: 10}]}>{t('find-your-localization-(optional)')}</Text>

                        <TextInput multiline={true} style={[GlobalStyles.textInput, {marginTop: 15}]} placeholder={t('description-0-2000-symbols')} defaultValue={cardData.description} onChangeText={(newVal) => {setCardData({...cardData, description: newVal})}} placeholderTextColor={Colors.white}/>
                        <Text style={[GlobalStyles.helperText, {marginTop: 10}]}>{t('description-(optional)')}</Text>


                        <View style={{marginTop: 25, flexDirection: 'row', height: 50, width: '100%'}}>
                            {visibilityOptions.map((opt) => {
                                return (
                                    <Pressable onPress={() => {
                                        setCardData({
                                            ...cardData,
                                            visibility: opt.key
                                        })
                                    }} style={{width: '33.3%', justifyContent: 'center',backgroundColor: (opt.key == cardData.visibility ? Colors.white : Colors.lighterDark)}} key={opt.key}>
                                        <Text style={[GlobalStyles.simpleText, {textAlign: 'center' ,color: (opt.key == cardData.visibility ? Colors.dark : Colors.white)}]}>{opt.title}</Text>
                                    </Pressable>
                                )
                            })}
                        </View>
                        <Text style={[GlobalStyles.helperText, {marginTop: 10}]}>{t("Choose visibility (Private - nobody can see your buisness card, QR only - only users that have QR code of buisness card can see it, Public - everyone can see buisness card)")}</Text>


                        <TextInput style={[GlobalStyles.textInput, {marginTop: 20, marginBottom: 10}]} placeholder={t('contact-phone-number')} defaultValue={cardData.contact_number} onChangeText={setContactNumber} placeholderTextColor={Colors.white}/>
                        <Text style={[GlobalStyles.helperText]}>{t("write-your-contact-phone-number-(optional)")}</Text>
                        
                        <TextInput style={[GlobalStyles.textInput, {marginTop: 15, marginBottom: 10}]} placeholder={t('contact-email')} defaultValue={cardData.contact_email} onChangeText={setContactEmail} placeholderTextColor={Colors.white}/>
                        <Text style={[GlobalStyles.helperText]}>{t("write-your-contact-email-(optional)")}</Text>


                        <Text style={[GlobalStyles.h3Text, {textAlign: 'center', marginVertical: 15}]}>{t('add-contact-links')}</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <TextInput style={[GlobalStyles.textInput, {width: '40%'}]} placeholder={t('new-link-title')} value={newLink.title} onChangeText={(newLinkTitle) => {setNewLink({title: newLinkTitle, link: newLink.link})}} placeholderTextColor={Colors.white}/>
                            <TextInput style={[GlobalStyles.textInput, {width: '40%'}]} placeholder={t("new-link-url")} value={newLink.link} onChangeText={(newLinkL) => {setNewLink({title: newLink.title, link: newLinkL})}} placeholderTextColor={Colors.white}/>
                        </View>

                        <Pressable onPress={() => {
                            if (cardData.contactLinksRelation.length > 10) {
                                setWarning(t("number-of-links-cant-be-bigger-than-10"));
                                return;
                            }

                            setCardData({
                                ...cardData,
                                contactLinksRelation: [...cardData.contactLinksRelation, newLink]
                            });

                            setNewLink({title: '', link: ''});
                        }} style={[GlobalStyles.grayButton, {marginVertical: 15, flexDirection: 'row'}]}>
                            <Text style={[GlobalStyles.simpleText, {marginRight: 7}]}>{t('add-link')}</Text>
                            <FontAwesome6 name="add" size={20} color={Colors.white} />
                        </Pressable>

                        <View style={{paddingBottom: 50}}>
                            {cardData.contactLinksRelation.map((contactLink, idx) => {
                                return (
                                    <View key={idx} style={{flexDirection: 'row', width: '100%'}}>
                                        <Entypo name="link" size={20} color={Colors.white} />
                                        <Text style={[GlobalStyles.simpleText, {marginTop: 5, marginLeft: 7}]}>{contactLink.title} - <Text style={{color: Colors.blue}} onPress={() => Linking.openURL(contactLink.link)}>{t('click-here')}</Text></Text>
                                    
                                        <Pressable style={{marginLeft: 'auto'}} onPress={() => {
                                            setCardData({
                                                ...cardData,
                                                contactLinksRelation: cardData.contactLinksRelation.filter((val, delIdx) => {
                                                    
                                                    return (delIdx != idx);
                                                })
                                            });

                                            
                                        }}>
                                            <AntDesign name="delete" size={20} color={Colors.orange} />
                                        </Pressable>
                                    </View>
                                )
                            })}
                            
                            <Text style={[GlobalStyles.h3Text, {textAlign: 'center', marginVertical: 10}]}>{t("you-can-choose-image-from-gallery-or-easily-create-business-card-using-template")}!</Text>
                            <View style={{ marginVertical: 20}}>
                                {cardData.templateJson ?
                                    <TemplateDisplay template={cardData.templateJson} cardData={cardData} /> :
                                    <Image style={GlobalStyles.CardImage} source={cardData.image ? { uri: getValidAvatarUri(cardData.image) } : require('../../assets/card_1050x600_previewpng.png')} resizeMode="contain" />
                                }
                            </View>

                            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
                                {(!cardData.isExists && !cardData.templateJson) &&
                                    <CardImageInput setCardImage={setCardImage} buttonProps={{width: cardData.image ? '100%' : '46%'}} />
                                }

                                {!cardData.image && <CreateFromTemplateButton navigation={navigation} cardData={cardData} setCardData={setCardData}/>}
                            </View>

                            <Text style={GlobalStyles.warning}>{warning}</Text>

                            <Pressable style={[GlobalStyles.blueButton, {marginBottom: 100, marginTop: 25, flexDirection: 'row'}]} onPress={addCard}>
                                <Text style={[GlobalStyles.simpleText, {marginRight: 7}]}>{cardData.isExists ? t("update-buisness-card") : t("add-buisness-card")}</Text>
                                {cardData.isExists ? <MaterialIcons name="update" size={20} color={Colors.white} /> : <FontAwesome6 name="add" size={20} color={Colors.white} />}
                            </Pressable>
                        </View>
                    </View>
                }
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    formContainer: {

    },

})