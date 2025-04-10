import { View } from "react-native"
import { useTranslation } from "react-i18next";
import { MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

import ChoosingInputList from "./CoosingInputList"
import { apiHost } from "../ApiConfig"
import { Colors } from "../globalStyles/GlobalStyles";
import ChooseGlobalCategory from './GlobalCategories/ChooseGlobalCategory'

export function FilterCards({ setFilterArgs, filterArgs }) {
    const {t} = useTranslation();


    function setNewCategory(newCategory) {
        if (!newCategory || (newCategory && typeof newCategory != 'string')) {
           
            setFilterArgs((oldVal) => {
                return {...oldVal, category_id: newCategory ? newCategory.id : -1}
            });
        }

    }

    function setNewLocation(newLocation) {
        if (!newLocation || (newLocation && typeof newLocation != 'string')) {
           
            setFilterArgs((oldVal) => {
                return {...oldVal, localization_id: newLocation ? newLocation.id : -1}
            });
        
        }
    }

    function setNewGlobalCategory(newId) {
        setFilterArgs((oldVal) => {
            return {...oldVal, global_category_id: newId}
        });
    }

    return (
        <View style={{ justifyContent: 'space-between', marginVertical: 10 }}>
            
            <ChoosingInputList setOutputData={setNewCategory} apiLink={`${apiHost}/api/cards/get_categories`} placeholderText={t('choose-category')} />
            
            <View style={{marginVertical: 10}}></View>
            <ChooseGlobalCategory globalCategoryId={filterArgs.global_category_id} setGlobalCategoryId={setNewGlobalCategory} />

            <View style={{marginVertical: 10}}></View>
            <ChoosingInputList setOutputData={setNewLocation} apiLink={`${apiHost}/api/cards/get_cities`} placeholderText={t('choose-localization')} />
        </View>
    )
}