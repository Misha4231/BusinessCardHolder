import { View, StyleSheet, Text, Modal, Pressable, TextInput } from "react-native"
import { useEffect, useState } from "react";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useTranslation } from "react-i18next";
import ColorPicker, { Panel1, HueSlider } from 'reanimated-color-picker';
import SelectDropdown from 'react-native-select-dropdown'
import { AntDesign, Entypo, MaterialCommunityIcons, FontAwesome5, MaterialIcons, Fontisto } from '@expo/vector-icons';

import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles";


export default function TemplateEditPanel({ templateJson, setTemplateJson, currEditablePropertyIdx, setCurrEditablePropertyIdx}) {
    const { t } = useTranslation();
    
    const [showModal, setShowModal] = useState(false);
    

    function updateTextContent(val) {
        const updatedTemplateState = { ...templateJson };
        updatedTemplateState.templateData[currEditablePropertyIdx].content = val;

        setTemplateJson(updatedTemplateState);
    }

    const onSelectColor = ({ hex }) => {
        const updatedTemplateState = { ...templateJson };
        updatedTemplateState.templateData[currEditablePropertyIdx].style.color = hex;

        setTemplateJson(updatedTemplateState);
    };

    function dropCurrProperty() {
        const updatedTemplateState = { ...templateJson };
        updatedTemplateState.templateData.splice(currEditablePropertyIdx, 1);
        setCurrEditablePropertyIdx(templateJson.templateData.length > 0 ? 0 : -1);

        setTemplateJson(updatedTemplateState);
    }

    function updateFontSize(values) {
        const updatedTemplateState = { ...templateJson };
        updatedTemplateState.templateData[currEditablePropertyIdx].style.fontSize = values[0];

        setTemplateJson(updatedTemplateState);
    }
    function updateFontWeight(values) {
        const updatedTemplateState = { ...templateJson };
        updatedTemplateState.templateData[currEditablePropertyIdx].style.fontWeight = values[0];

        setTemplateJson(updatedTemplateState);
    }

    return (
        <View>
            <Pressable style={[GlobalStyles.blueButton, styles.inputWrapper, { marginTop: 15 }]} onPress={() => {
                let maxIdx = 0;
                templateJson.templateData.forEach(element => {
                    if (element.type == 'additional') {
                        maxIdx = Math.max(maxIdx, parseInt(element.property.split('_')[1]));
                    }
                });
        
                const newProperty = `additionalText_${maxIdx + 1}`;
                const updatedTemplateState = { ...templateJson };
                updatedTemplateState.templateData.push({
                    property: newProperty,
                    position: {
                        x: 0,
                        y: 0
                    },
                    style: {
                        color: "#c2c2c2",
                        fontSize: 15,
                        fontWeight: 500
                    },
                    type: "additional",
                    content: "Additional text"
                })

                setTemplateJson(updatedTemplateState);
            }}>
                <Text style={GlobalStyles.simpleText}>{t('add-additional-text')}</Text>
            </Pressable>

            {currEditablePropertyIdx != -1 && <View style={styles.editTextBlock}>
                <View style={{flexDirection: "row"}}>
                    <Text style={[GlobalStyles.h3Text]}>
                        {t('editable-text')}: <Text style={{ textDecorationLine: 'underline' }}>{templateJson['templateData'][currEditablePropertyIdx].property}</Text>
                    </Text>
                    <Pressable style={{ marginLeft: 10 }} onPress={dropCurrProperty}>
                        <AntDesign name="delete" size={22} color={Colors.orange} />
                    </Pressable>
                </View>

                <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="format-size" size={20} color={Colors.white} />
                    <Text style={[GlobalStyles.simpleText, {marginHorizontal: 5}]}>{t('font-size')}: </Text>
                    <MultiSlider min={5} max={60} sliderLength={100} values={[templateJson['templateData'][currEditablePropertyIdx].style.fontSize]} onValuesChange={updateFontSize}/>
                </View>
                <View style={styles.inputWrapper}>
                    <FontAwesome5 name="bold" size={20} color={Colors.white} />
                    <Text style={[GlobalStyles.simpleText, {marginHorizontal: 5}]}>{t('font-weight')}: </Text>
                    <MultiSlider min={100} max={900} sliderLength={100} values={[templateJson['templateData'][currEditablePropertyIdx].style.fontWeight]} step={100} onValuesChange={updateFontWeight} />
                </View>
                <View style={styles.inputWrapper}>
                    <MaterialIcons name="format-color-text" size={20} color={Colors.white} />
                    <Text style={[GlobalStyles.simpleText, {marginHorizontal: 5}]}>{t('color')}: </Text>
                    <Pressable onPress={() => setShowModal(true)} style={{backgroundColor: templateJson['templateData'][currEditablePropertyIdx].style.color, padding: 13, borderRadius: 100}}></Pressable>
                    
                    <Modal transparent={true} visible={showModal} animationType='slide'>
                        <View style={styles.centeredViewWrapper}>
                            <View style={styles.centeredView}>
                                <View style={styles.colorPickerWrapper}>
                                    <ColorPicker style={{ width: '80%' }} onComplete={onSelectColor}>
                                        <Panel1 />
                                        <HueSlider />
                                    </ColorPicker>

                                    <Pressable onPress={() => setShowModal(false)} style={[GlobalStyles.blueButton, {width: '50%', marginTop: 30}]}>
                                        <Text style={[GlobalStyles.simpleText]}>OK</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>

                {templateJson['templateData'][currEditablePropertyIdx].type == 'additional' && <View style={styles.inputWrapper}>
                    <TextInput style={[GlobalStyles.textInput, { width: '100%' }]} defaultValue={templateJson['templateData'][currEditablePropertyIdx].content} onChangeText={updateTextContent} placeholder={t('text-content')}  placeholderTextColor={Colors.white}/>
                </View>}
            </View>}
        </View>
    )
}

const styles = StyleSheet.create({
    editTextBlock: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    centeredViewWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        width: '90%',
    },
    colorPickerWrapper: {
        justifyContent: "center",
        alignItems: 'center',
        backgroundColor: Colors.lighterDark,
        width: 300,
        paddingVertical: 30,
        borderRadius: 10
    },
    dropdownButtonStyle: {
        backgroundColor: Colors.lighterDark,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 50,
        paddingVertical: 10
      },
      dropdownButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
      },
      dropdownMenuStyle: {
        backgroundColor: Colors.lighterDark,
        borderRadius: 8,
      },
      dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
      },
})