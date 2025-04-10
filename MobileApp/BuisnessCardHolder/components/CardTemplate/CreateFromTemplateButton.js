import { View, Pressable, Text, Modal, StyleSheet } from "react-native"
import { useTranslation } from "react-i18next"
import { Entypo } from '@expo/vector-icons';

import GlobalStyles, { Colors } from "../../globalStyles/GlobalStyles"
import { useContext, useState } from "react";
import { UserContext } from "../../src/context/UserContext";

export default function CreateFromTemplateButton({ navigation, cardData, setCardData }) {
    const { t } = useTranslation();

    const [, , currUserData,] = useContext(UserContext);
    const [warningModalVisible, setWarningModalVisible] = useState(false);
    const [warning, setWarning] = useState('');

    function openTemplateForm() {
        const emptyFields = [];

        if (!currUserData.fullName) emptyFields.push(t('full-name'));
        if (!cardData.contact_email) emptyFields.push(t('contact-email'));
        if (!cardData.contact_number) emptyFields.push(t('contact-phone-number'));
        if (!cardData.city_id && !cardData?.new_localization) emptyFields.push(t('localization'));

        if (emptyFields.length) {
            setWarning(`${t('you-have-not-filled-the-following-fields')}: ${emptyFields.join(', ')}`);

            setWarningModalVisible(true);
        } else {
            setWarningModalVisible(false);

            if (cardData.templateJson) navigation.navigate("EditTemplate", {cardData: cardData, template: cardData.templateJson, setCardData: setCardData, popToCardForm: 1})
            else navigation.navigate('ProfilePage', { screen: "CreateCardFromTemplate", params: { setCardData: setCardData, cardData: cardData } });
        }
    }

    return (
        <View style={{width: cardData.templateJson ? '100%' : '46%'}}>
            {(!cardData.isExists || cardData.templateJson) &&
                <Pressable style={[
                        GlobalStyles.grayButton,
                    ]} onPress={openTemplateForm}>

                    <Text style={[GlobalStyles.simpleText, { textAlign: 'center' }]}>
                        {cardData.templateJson ? t('update-business-card') : t('create-using-template')}
                    </Text>

                </Pressable>
            }

            <Modal
                animationType="slide"
                transparent={true}
                visible={warningModalVisible}
                onRequestClose={() => { setWarningModalVisible(!warningModalVisible); }}
            >
                <View style={styles.centeredViewWrapper}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={[GlobalStyles.warning, {textAlign: 'center'}]}>{warning}</Text>
                            
                            <Entypo name="warning" size={80} color={Colors.orange} style={{marginTop: 20}} />

                            <View style={styles.modalButtonsContainer}>
                                <Pressable style={[GlobalStyles.blueButton, {marginBottom: 10}]} onPress={() => { setWarningModalVisible(false); }}>
                                    <Text style={[GlobalStyles.simpleText, { textAlign: 'center' }]}>{t('go-back-and-fill-fields')}</Text>
                                </Pressable>
                                <Pressable style={[GlobalStyles.grayButton]} onPress={() => {
                                    setWarningModalVisible(false);
                                    
                                    if (cardData.templateJson) navigation.navigate("EditTemplate", {cardData: cardData, template: cardData.templateJson, setCardData: setCardData, popToCardForm: 1})
                                    else navigation.navigate('ProfilePage', { screen: "CreateCardFromTemplate", params: { setCardData: setCardData, cardData: cardData } });
                                }}>
                                    <Text style={[GlobalStyles.simpleText, { textAlign: 'center' }]}>{t('continue-without-omitted-fields')}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}


const styles = StyleSheet.create({
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
    modalView: {
        justifyContent: "center",
        alignItems: 'center',
        padding: 35,
        backgroundColor: Colors.lighterDark,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        height: 350
    },
    modalButtonsContainer: {
        marginTop: 30,
    }
})