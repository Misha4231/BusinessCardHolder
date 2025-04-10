import { SafeAreaView, View, StyleSheet, Image, Text, Pressable, ScrollView } from "react-native";
import  { useRef, useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { useFocusEffect } from '@react-navigation/native';

import { UserContext } from "../../src/context/UserContext";
import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles";
import { getValidAvatarUri } from "../ImagePicker";
import EditableTemplateView from "./EditableTemplateView";
import TemplateEditPanel from "./TemplateEditPannel";



export default function EditTemplatePage({ navigation, route }) {
    const { t } = useTranslation();
    
    const [templateJson, setTemplateJson] = useState(route.params.template);
    const [currEditablePropertyIdx, setCurrEditablePropertyIdx] = useState(templateJson.templateData.length > 0 ? 0 : -1);


    useEffect(() => {
        
    }, [templateJson])

    return (
        <SafeAreaView style={GlobalStyles.area}>
            <ScrollView style={GlobalStyles.bodyWrapper}>
                <EditableTemplateView templateJson={templateJson} setTemplateJson={setTemplateJson} cardData={route.params.cardData} currEditablePropertyIdx={currEditablePropertyIdx} setCurrEditablePropertyIdx={setCurrEditablePropertyIdx} />

                <TemplateEditPanel templateJson={templateJson} setTemplateJson={setTemplateJson} currEditablePropertyIdx={currEditablePropertyIdx} setCurrEditablePropertyIdx={setCurrEditablePropertyIdx} />
                
                <Pressable style={[GlobalStyles.blueButton, {marginTop: 10}]} onPress={() => {
                    route.params.setCardData((OldCardData) => ({ 
                        ...OldCardData,
                        templateJson: templateJson
                    }))

                    navigation.pop(route.params.popToCardForm);
                }}>
                    <Text style={GlobalStyles.simpleText}>{t('submit-template')}</Text>
                </Pressable>

                <Pressable style={[GlobalStyles.grayButton, { marginTop: 20 }]} onPress={() => {
                    navigation.navigate('ProfilePage', { screen: "CreateCardFromTemplate", params: { setCardData: route.params.setCardData, cardData: route.params.cardData, setTemplateJson: setTemplateJson } });
                }}>
                    <Text style={GlobalStyles.simpleText}>{t('change-choosen-template')}</Text>
                </Pressable>
                <Text style={{marginBottom: 100}}></Text>
            </ScrollView>
        </SafeAreaView>
    )
}

