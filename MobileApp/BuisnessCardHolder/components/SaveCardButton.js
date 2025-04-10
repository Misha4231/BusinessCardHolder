import { useCallback, useContext, useEffect, useState } from "react";
import { View, Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { Fontisto } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

import GlobalStyles, { Colors } from "../globalStyles/GlobalStyles";
import { UserContext } from "../src/context/UserContext";
import { apiHost } from "../ApiConfig";
import { SavedCardsContext } from "../src/context/SavedCardsContext";

export default function SaveCardButton({ cardData }) {
    const {t} = useTranslation();
    const [token,,currUserData,] = useContext(UserContext);
    const [isCardSaved, setIsCardSaved] = useState(false);
    const [savedCards, setSavedcards] = useContext(SavedCardsContext);

    useFocusEffect(useCallback(() => {
        async function fetchIsCardSaved() {
            const requestOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${token}`
                },
            };
    
            const response = await fetch(`${apiHost}/api/cards/is_user_save_card?cardId=${cardData.id}`, requestOptions);
            const data = await response.json();

            if (response.ok) {
                setIsCardSaved(data.isSaved);
            }
        }

        fetchIsCardSaved();
    }, []))

    async function saveCard() {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`
            },
            body: JSON.stringify({
                cardId: cardData.id
            })
        };

        const response = await fetch(`${apiHost}/api/cards/save_card`, requestOptions);
        
        if (response.ok) {
            setIsCardSaved(true);
            setSavedcards([]);
        }
    }
    
    async function removeSavedCard() {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`
            },
            body: JSON.stringify({
                cardId: cardData.id
            })
        };

        const response = await fetch(`${apiHost}/api/cards/remove_card_save`, requestOptions);
        
        if (response.ok) {
            setIsCardSaved(false);
            setSavedcards([]);
        }
    }

    async function updateCard() {
        if (isCardSaved) {
            await removeSavedCard();
        } else {
            await saveCard();
        }
    }

    return (
        <View>
            {(currUserData?.id != cardData.ownerRelation?.id) && <Pressable style={[GlobalStyles.blueButton, {flexDirection: 'row'}]} onPress={updateCard}>
                <Text style={[GlobalStyles.simpleText, {marginRight: 8}]}>{isCardSaved ? t('remove-from-saved') : t('save-buisness-card')}</Text>
                {isCardSaved ?
                    <AntDesign name="delete" size={20} color={Colors.white} /> : 
                    <Fontisto name="save" size={20} color={Colors.white} />
                }
            </Pressable>}
        </View>
    )
}