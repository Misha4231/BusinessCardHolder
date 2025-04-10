import { FlatList, SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native"
import { useTranslation } from "react-i18next";
import { cloneDeep } from 'lodash';

import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles"
import { useEffect, useState } from "react"
import { apiHost } from "../../ApiConfig";
import TemplateDisplay from "./TemplateDisplay";

function TemplateListRenderItem({ coosenTemplate, setCoosenTemplate, template, cardData }) {

    return (
        <Pressable onPress={() => {
            setCoosenTemplate(template.id);
        }}
            style={[{padding: 5}, coosenTemplate == template.id && { borderWidth: 1, borderColor: Colors.blue, borderStyle: 'dashed' , borderRadius: 10 }]}
        >
            <TemplateDisplay template={template} cardData={cardData} />
        </Pressable>
    )
}

export default function TemplateFormPage({ navigation, route }) {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState([]);
    const [choosenTemplate, setCoosenTemplate] = useState(null);

    function navigateToEditTemplate() {
        let template = templates.find(t => t.id === choosenTemplate);
        let templateCopy = cloneDeep(template);

        if (route.params.setTemplateJson) {
            route.params.setTemplateJson(templateCopy);
        }
        navigation.navigate("EditTemplate", {cardData: route.params.cardData, template: templateCopy, setCardData: route.params.setCardData, popToCardForm: route.params.cardData.templateJson ? 1 : 2})
    }

    function chooseTemplate(newTemplateId) {
        if (newTemplateId == choosenTemplate) {
            navigateToEditTemplate();
        }

        setCoosenTemplate(newTemplateId);
    }

    useEffect(() => {
        async function fetchTemplates() {
            const response = await fetch(`${apiHost}/api/cards/get_templates`, { method: "GET" });
            const data = await response.json();

            setTemplates(data);
        }

        fetchTemplates();
    }, []);


    return (
        <SafeAreaView style={GlobalStyles.area}>
            <View style={GlobalStyles.bodyWrapper}>
                <FlatList
                    data={templates}
                    renderItem={({ item, index }) => <TemplateListRenderItem coosenTemplate={choosenTemplate} setCoosenTemplate={chooseTemplate} template={item} cardData={route.params.cardData} />}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={() => {
                        return (
                            <Text style={[GlobalStyles.h1Text, { textAlign: 'center', marginBottom: 10 }]}>{t('choose-template')}</Text>
                        )
                    }}
                    ListFooterComponent={() => {
                        return (
                            <Text style={{paddingBottom: 100}}></Text>
                        )
                    }}
                />
                {choosenTemplate && <Pressable style={[GlobalStyles.blueButton, styles.selectButton]} onPress={navigateToEditTemplate}>
                    <Text style={GlobalStyles.simpleText}>{t('submit-choosen-template')}</Text>
                </Pressable>}
            </View>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    selectButton: {
        position: 'absolute',
        bottom: 120,
        alignSelf: 'center'
    }
})