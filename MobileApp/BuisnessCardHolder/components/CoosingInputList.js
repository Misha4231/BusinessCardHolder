import { View, StyleSheet, TextInput, ScrollView, Pressable, Text } from "react-native";
import { useState, useEffect } from "react";
import transliterate from 'transliterate';
import { MaterialIcons } from '@expo/vector-icons';

import GlobalStyles from "../globalStyles/GlobalStyles";
import { Colors } from "../globalStyles/GlobalStyles";

export default function CoosingInputList({ initSearch, setOutputData, apiLink, placeholderText }) {
    const [existingOptions, setExistingOptions] = useState(new Array);
    const [similarOptions, setSimilarOptions] = useState(new Array);
    const [searchOption, setSearchOption] = useState(initSearch ? initSearch : '');

    useEffect(() => {
        async function fetchCategories() {
            const response = await fetch(apiLink, {method: "GET"});
            const data = await response.json();
            
            setExistingOptions(data);
        }

        fetchCategories();
    }, [])


    function updateSimiralOptions(){
        setSimilarOptions([]);

        if (searchOption.length >= 2) {
            var newSimilarOptions = new Array();
            var validSerchOption = transliterate(searchOption.toLowerCase());
            
            existingOptions.every((existingOpt) => {
                if (existingOpt.title.toLowerCase().includes(validSerchOption)) {
                    newSimilarOptions.push(existingOpt);
                }

                if (newSimilarOptions.length > 5) {
                    return false;
                }
                
                return true;
            });
         
            setSimilarOptions(newSimilarOptions);
        }

    };

    function setOptionId(opt) {
        setOutputData(opt);
        setSearchOption(opt.title);

        setSimilarOptions([]);
    }

    return (
        <View>
            <View style={{flexDirection: 'row', width: '100%'}}>
                <TextInput style={[GlobalStyles.textInput, {width: '90%'}]} placeholder={placeholderText} value={searchOption} onChangeText={(newVal) => {
                    setSearchOption(newVal);
                    updateSimiralOptions();
                    setOutputData(newVal);
                }} placeholderTextColor={Colors.white}/>
                {searchOption.length > 0 && <Pressable style={{marginLeft: 8}} onPress={() => {
                    setSearchOption('');
                    setOutputData(null);
                }}>
                    <MaterialIcons name="clear" size={24} color={Colors.white} />
                </Pressable>}
            </View>

            {similarOptions.length > 0 && <View style={styles.similarOptionContainer}>
                
                {similarOptions.map((opt) => {
                    return (
                        <Pressable style={styles.similarOption} key={opt.id} onPress={() => {setOptionId(opt)}}>
                            <Text style={GlobalStyles.simpleText}>{opt.title}</Text>
                        </Pressable>
                    )
                })}
                   
                
            </View>}
        </View>
    )
}

const styles = StyleSheet.create({
    similarOptionContainer: {
        width: '90%',
        marginLeft: 5,
        padding: 10,
        flex: 1,
    },
    similarOption: {
        width: '100%',
        height: 30,
        backgroundColor: Colors.lighterDark,
        borderBottomColor: Colors.white,
        borderBottomWidth: 1,
        padding: 5
    }
})