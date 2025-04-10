import { View, Pressable, Text, Image, Modal, StyleSheet } from "react-native"
import { useTranslation } from "react-i18next";
import ImgToBase64 from 'react-native-image-base64';
import ImageResizer from "@bam.tech/react-native-image-resizer"

import GlobalStyles, {Colors} from "../../globalStyles/GlobalStyles"
import OpenImagePicker from "../ImagePicker"
import { useState } from "react";

/*
import ImageResizer from "@bam.tech/react-native-image-resizer"
ImageResizer.createResizedImage(imageUri, resizeWidth, resizeHeight, 'JPEG', 100, 0, undefined, false, {mode: 'stretch'}).then((response) => {

                ImgToBase64.getBase64String(response.uri)
                .then(base64String => {
                    setImage(`data:image/png;base64,${base64String}`);
                })
            });
*/

export default function CardImageInput({ setCardImage, buttonProps }) {
    const { t } = useTranslation();
    
    const [modalOpen, setModalOpen] = useState([false, '']);

    function onPickImage(imageUri) {
        ImgToBase64.getBase64String(imageUri)
        .then(base64String => {
            const b64 = `data:image/png;base64,${base64String}`;

            Image.getSize(
                b64,
                (width, height) => {
                    if (width == 1050 && height == 600) {
                        setCardImage(b64);
                    } else {
                        setModalOpen([true, imageUri]);

                    }
                }
            );
        })
        
    }

    function resizeImage() {
        ImageResizer.createResizedImage(modalOpen[1], 1050, 600, 'JPEG', 100, 0, undefined, false, {mode: 'stretch'}).then((response) => {

            ImgToBase64.getBase64String(response.uri)
                .then(base64String => {

                setCardImage(`data:image/png;base64,${base64String}`);
            })

        });
        setModalOpen([false, '']);
    }

    return (
        <View style={buttonProps}>
            <Pressable style={GlobalStyles.grayButton} onPress={() => { OpenImagePicker(onPickImage, true) }}>
                <Text style={[GlobalStyles.simpleText, {textAlign: 'center'}]}>{t('pick-from-gallery')}</Text>
            </Pressable>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalOpen[0]}
                onRequestClose={() => {
                    setModalOpen([!modalOpen[0], '']);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={[GlobalStyles.warning, {textAlign: 'center'}]}>{t('The size of given image is not 1050x600 pixels. Do you want to resize it?')}</Text>
                        
                        <Pressable style={[GlobalStyles.grayButton, {marginTop: 80, width: '100%'}]} onPress={() => { setModalOpen([false, '']) }}>
                            <Text style={GlobalStyles.simpleText}>{t('No, close')}</Text>
                        </Pressable>
                        <Pressable style={[GlobalStyles.blueButton, {marginTop: 12, width: '100%'}]} onPress={resizeImage}>
                            <Text style={GlobalStyles.simpleText}>{t('Resize image')}</Text>
                        </Pressable>
                        
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: Colors.lighterDark,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.orange,
        width: '80%'
    },

});