import { View, Text, Image, StyleSheet } from "react-native";
import { useContext, useState, useEffect } from "react";

import GlobalStyles from "../../globalStyles/GlobalStyles"
import { getValidAvatarUri } from "../ImagePicker";
import { UserContext } from "../../src/context/UserContext";
import TemplateReader from "./TemplateReader";

export default function TemplateDisplay({ template, cardData }) {
    const [, , currUserData,] = useContext(UserContext);
    const [templateReader, setTemplateReader] = useState(new TemplateReader(template));
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTemplateReader(new TemplateReader(template, templateReader.screenSettings()));
      }, [template]);

    function onLoading(event) {
        templateReader.onLayoutHandler(event);

        setLoading(false);
    }

    function extractTextContent(overlayText) {
        if (overlayText.type == 'additional') return overlayText.content;

        if (overlayText.property == 'fullName') return cardData.isExists === false ? currUserData.fullName : cardData.ownerRelation.fullName;
        else if (overlayText.property == 'localozation') return cardData.isExists === false ? (cardData.city_id ? cardData.new_localization.title : cardData.new_localization) : cardData?.categotyRelation?.title;
        else if (overlayText.property == 'email') return cardData.contact_email;
        else if (overlayText.property == 'phoneNumber') return cardData.contact_number;
    }

    return (
        <View>
            <View style={styles.imageContainer}>
                <Image resizeMode='center' style={[GlobalStyles.CardImage, { justifyContent: 'center' }]} source={{ uri: getValidAvatarUri(templateReader.getBackground()) }} onLayout={onLoading} />

                {!loading && templateReader.getTemplateData().map((overlayText) => {
                    return (
                        <Text key={overlayText.property}
                            style={[styles.overlayText, templateReader.getPropertyStyles(overlayText.property)]}>
                            {extractTextContent(overlayText)}
                        </Text>
                    )
                })}
            </View>
        </View>
    )
}

styles = StyleSheet.create({
    imageContainer: {
        position: 'relative'
    },
    overlayText: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        
    }
})