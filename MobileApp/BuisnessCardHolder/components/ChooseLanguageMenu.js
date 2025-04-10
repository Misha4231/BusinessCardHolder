import { useEffect, useState } from 'react';
import { View, SafeAreaView, FlatList, Text, Pressable, StyleSheet } from 'react-native'
import { Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import i18next, {languageResources} from './i18next';
import GlobalStyles, {Colors} from '../globalStyles/GlobalStyles';

function ListItem({ currLang, langItem, setSelected }) {

    return (
        <Pressable style={styles.listElement} onPress={() => {setSelected(langItem[0])}}>
            {langItem[0] == currLang && <Entypo name="check" size={20} color={Colors.white} style={{marginRight: 10}} />}
            <Text key={langItem} style={GlobalStyles.simpleText}>{langItem[0]} - { langItem[1]}</Text>
        </Pressable>
    )
}


export default function ChooseLanguageMenu() {
    const [selected, setSelected] = useState(i18next.language);
    const [languages, setLanguages] = useState();
    
    useEffect(() => {
        langs = [];

        for (const [key, value] of Object.entries(languageResources)) {
            langs.push([key, value.langTitle]);
        }
        setLanguages(langs);
    }, [])

    useEffect(() => {
        async function setLang() {
            await AsyncStorage.setItem('@language', JSON.stringify(selected));
        }
        
        setLang();
        i18next.changeLanguage(selected);
        
    }, [selected])

    return (
        <SafeAreaView style={GlobalStyles.area}>
            <View style={[GlobalStyles.bodyWrapper]}>
                <FlatList
                    data={languages}
                    renderItem={({ item }) => <ListItem currLang={selected} langItem={item} setSelected={setSelected} />}
                    keyExtractor={item => item}
                />
            </View>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    listElement: {
        width: '100%',
        padding: 10,
        flexDirection: 'row',
        borderBottomColor: Colors.white,
        borderBottomWidth: 1
    }
})