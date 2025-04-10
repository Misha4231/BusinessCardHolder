import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Pressable } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import GlobalStyles from '../../globalStyles/GlobalStyles';
import { Colors } from '../../globalStyles/GlobalStyles';

function QRScanner({ navigation }) {
    const { t } = useTranslation();

    const [hasPermission, setHasPermission] = useState(null);
    const [scanning, setScanning] = useState(true); // State to control scanning
    const isFocused = useIsFocused();

    const prefix = 'buisnesscardholder://card/';

    const getBarCodeScannerPermissions = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    useEffect(() => {
        getBarCodeScannerPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
       
        if (data.startsWith(prefix)) {
            const cardId = data.substring(prefix.length);
            navigation.navigate('Search', { screen: 'UserCardDetail', params: { cardId: parseInt(cardId) } })
        }
        setScanning(false);
    };



    return (
        <SafeAreaView style={GlobalStyles.area}>
            <View style={[GlobalStyles.bodyWrapper]}>
                {hasPermission ? <View style={styles.container}>
                    {isFocused && <BarCodeScanner
                        onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
                        style={StyleSheet.absoluteFillObject}
                        barCodeScannerSettings={{
                            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                            type: 'back'
                        }}
                    />}
                    {!scanning &&
                        <Pressable onPress={() => { setScanning(true); }} style={[GlobalStyles.blueButton, {width: 200, justifyContent: 'center', alignSelf: 'center'}]}>
                            <Text style={GlobalStyles.simpleText}>{t('scan-again')}</Text>
                        </Pressable>
                    }
                </View> : <View style={{justifyContent: 'center'}}>
                    <Text style={[GlobalStyles.simpleText, {marginVertical: 10}]}>{t('no-access-to-camera')}</Text>
                    <Pressable onPress={getBarCodeScannerPermissions} style={GlobalStyles.blueButton}>
                        <Text style={GlobalStyles.simpleText}>{t('set-camera-permissions')}</Text>
                    </Pressable>
                </View>}
            </View>
        </SafeAreaView>
    );
}

export default QRScanner;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'
    }
});