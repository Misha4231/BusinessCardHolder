import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from "react-i18next";
import { useFocusEffect } from '@react-navigation/native';

import { storage } from "../../MMKVStorage";
import { apiHost } from "../../ApiConfig";
import GlobalStyles from "../../globalStyles/GlobalStyles";
import RadioButton from "../Input/RadioButton";

export default function ChooseGlobalCategory({ globalCategoryId, setGlobalCategoryId }) {
    const { t } = useTranslation();

    const [globalCategoriesList, setGlobalCategoriesList] = useState([]);
    const [langCode, setLangCode] = useState('en');
    const [collapse, setCollapse] = useState(false);
    
    useFocusEffect(
        useCallback(() => {
            async function updateLang() {
                const lang = await AsyncStorage.getItem('@language');
                setLangCode(JSON.parse(lang ? lang : 'en'));
            }
            updateLang();
        }, [])
      );

    useEffect(() => {
        async function fetchCategories() {
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
            const response = await fetch(`${apiHost}/api/cards/get_global_categories`, options);
            const data = await response.json();

            if (response.ok) {
                setGlobalCategoriesList(data);
            }
        }

        fetchCategories();
    }, []);

    function onChoose(id) {
        setGlobalCategoryId((id == globalCategoryId) ? -1 : id);
    }
    
    return (
        <View>
            <Pressable style={[GlobalStyles.grayButton, {marginBottom: 8}]} onPress={() => { setCollapse(!collapse); }}>
                <Text style={[GlobalStyles.simpleText]}>{t('choose-global-category')}</Text>
            </Pressable>
            {collapse && globalCategoriesList.map((cat, index) => {
                
                return (
                    <Pressable 
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 5 }} 
                        key={cat.id} 
                        onPress={() => { onChoose(cat.id) }}
                    >
                        <RadioButton 
                            isActive={cat.id === globalCategoryId}
                            onChoose={() => { onChoose(cat.id) }}
                        />
                        <Text style={[GlobalStyles.simpleText, { marginLeft: 7 }]}>
                            {(langCode == 'en' || !cat.translation || !cat.translation[langCode]) ? cat.title : cat.translation[langCode]}
                        </Text>
                    </Pressable>
            )})}
        </View>
    )
}
