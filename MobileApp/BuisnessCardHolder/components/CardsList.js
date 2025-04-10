import { View, FlatList, Text, Pressable, Image, StyleSheet, Modal, Platform, RefreshControl } from "react-native";
import { useContext, useState, useCallback, useEffect } from "react";
import { AntDesign } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { Entypo } from '@expo/vector-icons';

import { apiHost } from "../ApiConfig";
import { UserContext } from "../src/context/UserContext";
import GlobalStyles, {Colors} from "../globalStyles/GlobalStyles";
import { getValidAvatarUri } from "./ImagePicker";
import { FilterCards } from "./FilterCards";
import TemplateDisplay from "./CardTemplate/TemplateDisplay";

const itemsPerBanner = 4;
var bannerUnitId = '';

let unitIdRequestOptions = {
    method: "GET",
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
};

fetch(`${apiHost}/api/cards/get_unit_ids`, unitIdRequestOptions).then(response => {
    response.json().then(res => {
        bannerUnitId = Platform.OS == 'android' ? res.android : res.ios;
    })
})

function CardItem({ card, navigation, onDeletePress, setCards, sessionUser, index }) {
    return (
        <View key={card.id} style={styles.cardItem}>
            <View style={styles.cardHeader}>
                <Text style={[GlobalStyles.h3Text, {textAlign: 'center'}]}>{card?.categotyRelation?.title}</Text>
            
                {sessionUser?.id == card.owner_id && <View style={{flexDirection: 'row'}}>
                    <Pressable style={{marginRight: 8}} onPress={() => {navigation.navigate("ProfilePage" ,{screen: 'UserEditCard', params: {...card, isExists: true, setCards: setCards}})}}>
                        <AntDesign name="edit" size={34} color={Colors.white} />
                    </Pressable>
                    <Pressable onPress={() => {
                        onDeletePress(card.id);
                    }}>
                        <AntDesign name="delete" size={34} color={Colors.white} />
                    </Pressable>
                </View>}
            </View>
            <Pressable style={{width: '100%', marginVertical: 20}} onPress={() => {navigation.navigate("UserCardDetail", {cardId: card.id});}}>
                {card.image ?
                    <Image resizeMode='center' style={[GlobalStyles.CardImage, { justifyContent: 'center', marginHorizontal: 5 }]} source={{ uri: getValidAvatarUri(card.image) }} /> :
                    <TemplateDisplay template={card.templateJson} cardData={card}/>
                }
            </Pressable>

            {((index + 1) % itemsPerBanner == 0) && <View style={{marginVertical: 20}}>
                <BannerAd
                    unitId={bannerUnitId}
                    size={BannerAdSize.LARGE_BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true
                    }}
                />
            </View>}
        </View>
    )
}

export default function CardsList({ apiEndpoint, navigation, cards, setCards, HeaderComponent}) {
    const {t} = useTranslation();
    const [token,,sessionUserData,] = useContext(UserContext);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteModalId, setDeleteModalId] = useState(-1);

    const [defaultFilterArgs, setDefaultFilterArgs] = useState({
        localization_id: -1,
        category_id: -1,
        global_category_id: -1,
    })
 
    const [page, setPage] = useState(1);

    async function fetchUserCards() {
        if (!page || loading) {
            return;
        }

        setLoading(true);
    
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`
            },
        };
 
        const response = await fetch(`${apiHost}${apiEndpoint}page=${page}&${new URLSearchParams(defaultFilterArgs)}`, requestOptions);
        const data = await response.json().then((r) => {
            setPage(r.nextPage);
            setCards([...cards, ...r.cards]);
        });

        
        setLoading(false);
    }

    useEffect(() => {
        setCards([]);
        setPage(1);
        
    }, [defaultFilterArgs]);

    useEffect(() => {
        if (cards.length == 0) {
            setPage(1);

            fetchUserCards();
        }
    }, [cards])

    async function deleteCard() {
        if (deleteModalId == -1) {
            setDeleteModalOpen(false);
            return;
        }

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`
            },
            body: JSON.stringify({
                card_id: deleteModalId
            })
        };

        const response = await fetch(`${apiHost}/api/cards/delete`, requestOptions);
        if (response.ok) {
            setCards(cards.filter((val) => {
                return val.id != deleteModalId;
            }))
            
            setDeleteModalOpen(false);
            setDeleteModalId(-1);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);

        setLoading(false);
        setCards([]);

        
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    return (
        <View style={{flex: 1}}>
            <FlatList
                data={cards}
                renderItem={({item, index}) => <CardItem card={item} sessionUser={sessionUserData} navigation={navigation} onDeletePress={(cardId) => {
                    setDeleteModalOpen(true);
                    setDeleteModalId(cardId);
                }} setCards={setCards} index={index} />}
                contentContainerStyle={{paddingVertical: 10, marginVertical: 10, paddingHorizontal: 5}}
                ListFooterComponent={() => {
                    return  (
                        <View>
                            {!cards.length && 
                                <Pressable onPress={fetchUserCards} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                                    <Entypo name="block" size={40} color={Colors.white} />
                                    <Text style={[GlobalStyles.simpleText, {marginTop: 10}]}>{t('no-business-cards')}</Text>
                                </Pressable>
                            }
                            <Text style={{ marginBottom: 100 }}></Text>
                        </View>
                    )
                }}
                onEndReachedThreshold={0.9}
                onEndReached={fetchUserCards}
                keyExtractor={(card, idx) => card.id}
                ListHeaderComponent={        
                    <View>
                        <HeaderComponent/>
                        {(cards.length == 0 && defaultFilterArgs.category_id == -1 && defaultFilterArgs.localization_id == -1 && defaultFilterArgs.global_category_id == -1) ? null : <FilterCards filterArgs={defaultFilterArgs} setFilterArgs={setDefaultFilterArgs}/>}
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
                

            <Modal animationType="slide" transparent={true} visible={deleteModalOpen} onRequestClose={() => {
                setDeleteModalOpen(false);
                setDeleteModalId(-1);
            }}>
                <View style={styles.centeredModalView}>
                    <View style={styles.modalView}>
                        <Text style={[GlobalStyles.h3Text, {textAlign: 'center', marginBottom: 15}]}>{t("are-you-sure-you-want-to-delete-your-buisness-card")}</Text>
                        <Pressable style={[GlobalStyles.grayButton, styles.modalButtons]} onPress={deleteCard}>
                            <AntDesign name="delete" size={20} color={Colors.white} />
                            <Text style={[GlobalStyles.simpleText, {marginTop: 4, marginLeft: 5}]}>{t('delete')}</Text>
                        </Pressable>
                        <Pressable style={[GlobalStyles.blueButton, styles.modalButtons]} onPress={() => {
                            setDeleteModalOpen(false);
                            setDeleteModalId(-1);
                        }}>
                            <MaterialIcons name="cancel" size={20} color={Colors.white} />
                            <Text style={[GlobalStyles.simpleText, {marginTop: 4, marginLeft: 5}]}>{t('cancel')}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    cardItem: {
        paddingVertical: 8,
        borderRadius: 5,
        shadowColor: Colors.white,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.50,
        shadowRadius: 6,
        
        marginBottom: 20
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10
    },
    centeredModalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: Colors.lighterDark,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: Colors.white,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        width: 200,
        padding: 5,
        marginBottom: 10
    }
})