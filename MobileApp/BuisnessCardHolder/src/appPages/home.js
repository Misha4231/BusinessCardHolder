import { Text, View, SafeAreaView, StyleSheet, Pressable } from "react-native"
import { useContext, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import { UserContext } from "../context/UserContext";
import GlobalStyles from "../../globalStyles/GlobalStyles";
import CardsList from "../../components/CardsList";
import { SavedCardsContext } from "../context/SavedCardsContext";


export default function HomeScreen({ navigation }) {
    const {t} = useTranslation();

    var [token, , userData,] = useContext(UserContext);
    const [savedCards, setSavedcards] = useContext(SavedCardsContext);
    
    useEffect(() => {
        if (!token) {
            navigation.navigate('LoginPage');
        } else {
            navigation.navigate('Home');
            
        }
    }, [token])

    return userData ? (
        <SafeAreaView style={GlobalStyles.area}>
            <View style={GlobalStyles.bodyWrapper}>
                <View style={[styles.header]}>
                    <Text style={[GlobalStyles.h1Text, {marginTop: 5}]}>{t('saved-buisness-cards')}</Text>
                </View>

                <CardsList apiEndpoint={`/api/cards/saved_cards?`} navigation={navigation} cards={savedCards} setCards={setSavedcards} HeaderComponent={() => null} />

            </View>
        </SafeAreaView>
    ) : null;
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        height: 50,
        width: '100%',
        justifyContent: 'space-between'
    }
})

