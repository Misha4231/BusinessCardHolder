import { View, StyleSheet, Image } from "react-native"
import { useRef, useState, useContext } from "react";

import { UserContext } from "../../src/context/UserContext";
import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles";
import { getValidAvatarUri } from "../ImagePicker";
import DraggableText from "./DraggableText";

export default function EditableTemplateView({ templateJson, setTemplateJson, cardData, currEditablePropertyIdx, setCurrEditablePropertyIdx }) {
    const imageRef = useRef();

    const [, , currUserData,] = useContext(UserContext);
    const [borders, setBorders] = useState({
        imageStartX: 0,
        imageStartY: 0,
        imageEndX: 0,
        imageEndY: 0,
        WrapperPageMinX: 0,
        WrapperPageMinY: 0
    })
    
    function extractTextContent(overlayText) {
        if (overlayText.type == 'additional') return overlayText.content;

        if (overlayText.property == 'fullName') return !cardData.isExists ? currUserData.fullName : cardData.ownerRelation.fullName;
        else if (overlayText.property == 'localozation') return !cardData.isExists ? (cardData.city_id ? cardData.new_localization.title : cardData.new_localization) : cardData?.categotyRelation?.title;
        else if (overlayText.property == 'email') return cardData.contact_email;
        else if (overlayText.property == 'phoneNumber') return cardData.contact_number;
    }

    return (
        <View style={[styles.templatePreviewWrapper]}>
            <Image ref={imageRef} onLayout={(event) => {

                imageRef.current.measure((x, y, width, height, pageX, pageY) => {
                    
                    setBorders({
                        imageStartX: x,
                        imageStartY: y,
                        imageEndX: width,
                        imageEndY: height,
                        WrapperPageMinX: pageX,
                        WrapperPageMinY: pageY
                    });
                    
                });

                
            }} resizeMode='center' style={[GlobalStyles.CardImage, { justifyContent: 'center' }]} source={{ uri: getValidAvatarUri(templateJson.background) }} />
        
            {templateJson.templateData.map((overlayText, idx) => {
                return <DraggableText key={idx}
                    templateJson={templateJson}
                    templateDataIdx={idx}
                    setTemplateJson={setTemplateJson}
                    textContent={extractTextContent(overlayText)}
                    borders={borders}
                    currEditablePropertyIdx={currEditablePropertyIdx}
                    setCurrEditablePropertyIdx={setCurrEditablePropertyIdx}
                />
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    templatePreviewWrapper: {
        position: 'relative',
        padding: 0,
        
    },
    draggableBorder: {
        borderWidth: 2,
        borderColor: Colors.blue,
        borderStyle: 'dashed'
    },
    circle: {
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: Colors.blue,
        position: 'absolute',
        zIndex: 1100
    },
    topLeft: {
        top: -5,
        left: -5,
    },
    topRight: {
        top: -5,
        right: -5,
    },
    bottomLeft: {
        bottom: -5,
        left: -5,
    },
    bottomRight: {
        bottom: -5,
        right: -5,
    },
})