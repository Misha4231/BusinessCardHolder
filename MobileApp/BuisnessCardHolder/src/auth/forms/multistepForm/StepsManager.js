import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Text, View, StyleSheet, Button, Pressable } from "react-native"
import { useTranslation } from 'react-i18next';
import { AntDesign } from '@expo/vector-icons';

import FirstStep from "./FirstStep";
import SecondStep from "./SecondStep";
import ThirdStep from "./ThirdStep";
import FourthStep from "./FourthStep";

import GlobalStyles, { Colors } from "../../../../globalStyles/GlobalStyles";


const CurrentPageComponent = forwardRef(({currPage, globalWarningState, userFormData, setUserFormData}, ref) => {
    const validateRef = useRef(null);

    function isValidInput(){
        return validateRef.current.isValid()
    }

    useImperativeHandle(ref, () => ({
        isValidInput, 
    }));

    switch (currPage) {
        case 0:
            return <FirstStep ref={validateRef} globalWarningState={globalWarningState} userFormData={userFormData} setUserFormData={setUserFormData}/>
        case 1:
            return <SecondStep ref={validateRef} globalWarningState={globalWarningState} userFormData={userFormData} setUserFormData={setUserFormData}/>
        case 2:
            return <ThirdStep ref={validateRef} userFormData={userFormData} setUserFormData={setUserFormData}/>
        case 3:
            return <FourthStep ref={validateRef} userFormData={userFormData} setUserFormData={setUserFormData}/>
        default:
            return <FirstStep ref={validateRef} globalWarningState={globalWarningState} userFormData={userFormData} setUserFormData={setUserFormData}/>
    }
});

const StepsManager = ({submitRegistration}) => {
    const {t} = useTranslation();

    const [userFormData, setUserFormData] = useState({
        email: '',
        username: '',
        fullName: '',
        password: '',
        passwordConfirmation: '',
        avatar: "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
        errorMessage: '',
    })

    const [page, setPage] = useState(0);
    const currStepRef = useRef(null);
    const [globalWarning, setGlobalWarning] = useState('');
    

    function handleSubmitError(detail) {
        if (detail == "User with that email already exists") {
            setPage(0);
            setGlobalWarning(t('user-with-that-email-already-exists'))
        } else if (detail == "User with that username already exists") {
            setPage(1);
            setGlobalWarning(t('user-with-that-username-already-exists'))
        } else {
            console.log("Undifined error");
            setGlobalWarning('');
        }
    }

    async function nextPagePress() {
        if (!currStepRef.current.isValidInput()) return;
    
        if (page === 3) {
            var errorMsg = await submitRegistration(userFormData);

            if (errorMsg) {
                handleSubmitError(errorMsg);
            }
            
        } else {
            setPage(page + 1);
        }
    }
    
    function prevPagePress() {
        setPage(page - 1);
    }

    return (
        <View style={styles.wrapper}>
            <CurrentPageComponent ref={currStepRef} globalWarningState={[globalWarning, setGlobalWarning]} currPage={page} userFormData={userFormData} setUserFormData={setUserFormData}/>

            <View style={styles.bottomButtonsContainer}>
                <Pressable onPress={prevPagePress} style={[page != 0 && GlobalStyles.blueButton, styles.previousButton]}>
                    {page != 0 && <View style={{ flexDirection: 'row', alignContent: 'center' }}>
                        <AntDesign name="stepbackward" size={20} color={Colors.white} style={{marginRight: 3}} />
                        <Text style={GlobalStyles.simpleText}>{t('previous')}</Text>
                    </View>}
                </Pressable>
                
                <Pressable onPress={nextPagePress} style={[GlobalStyles.blueButton, styles.nextButton]}>
                    <Text style={GlobalStyles.simpleText}>{page != 3 ? t('next') : t('submit')}</Text>
                    {page != 3 && <AntDesign name="stepforward" size={20} color={Colors.white} style={{marginLeft: 3}} />}
                </Pressable>
            </View>
            
        </View>
    
    )
};

export default StepsManager;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 100,
    },

    bottomButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    previousButton: {
        alignSelf: 'flex-start',
    },
    nextButton: {
        alignSelf: 'flex-end',
        flexDirection: 'row'
    }
});