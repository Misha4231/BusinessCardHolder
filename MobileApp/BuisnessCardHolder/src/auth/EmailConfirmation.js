import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native"
import { useTranslation } from 'react-i18next';

import GlobalStyles from "../../globalStyles/GlobalStyles";
import { Colors } from "../../globalStyles/GlobalStyles";

const EmailConfirmation = ({ confirmationCode, confirmEmailSuccess }) => {
    const {t} = useTranslation();

    const [inputCode, setInputCode] = useState('');
    const [warning, setWarning] = useState('');

    function updateInputCode(newCode) {
        setWarning("");

        if (newCode.length < 7) {
            setInputCode(newCode);
        }
    }

    async function onSubmit() {
        if (confirmationCode != inputCode) {
            setWarning(t('invalid-confirmation-code'));
        } else {
            await confirmEmailSuccess();
        }
    }

    return (
        <View style={styles.wrapper}>
            <Text style={[GlobalStyles.h3Text, {paddingBottom: 50}]}>{t('you-have-received-6-digit-confirmation-code-to-your-new-email-address-enter-that-code-here')}</Text>

            <View>
                <TextInput style={GlobalStyles.textInput} placeholder={t("confirmation-code")} placeholderTextColor={Colors.white} defaultValue={inputCode} onChangeText={updateInputCode}/>

                <Text style={[GlobalStyles.helperText, styles.helperLabel]}>{t('enter-confirmation-code')}</Text>
                <Text style={[GlobalStyles.warning, styles.helperLabel]}>{warning}</Text>
            </View>

            <Pressable onPress={onSubmit} style={[GlobalStyles.blueButton, {marginBottom: 40}]}>
                <Text style={GlobalStyles.simpleText}>{t('submit')}</Text>
            </Pressable>
        </View>
    )
}

export default EmailConfirmation;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 100,
    },
    helperLabel: {
        marginTop: 10
    }
})