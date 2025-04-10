import { View, SafeAreaView, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

import GlobalStyles, {Colors} from "../../globalStyles/GlobalStyles";
import UserSearch from "../../components/UserSearch";
import CardSearch from "../../components/CardSearch";

export default function Search({ navigation }) {
    const [currSearchComponent, setCurrSearchComponent] = useState(1);
    
    return (
        <SafeAreaView style={GlobalStyles.area}>
            <View style={GlobalStyles.bodyWrapper}>                
                <View style={styles.headerChooseContainer}>
                    <Pressable style={[styles.headerChoose, { borderBottomColor: currSearchComponent == 1 ? Colors.orange : Colors.white }]} onPress={() => { setCurrSearchComponent(1) }}>
                        <View style={styles.searchIcon}>
                            <FontAwesome name="user" size={34} color={currSearchComponent == 1 ? Colors.orange : Colors.white} />
                        </View>
                    </Pressable>
                    <Pressable style={[styles.headerChoose, { borderBottomColor: currSearchComponent == 2 ? Colors.orange : Colors.white }]} onPress={() => { setCurrSearchComponent(2) }}>
                        <View style={styles.searchIcon}>
                            <AntDesign name="creditcard" size={34} color={currSearchComponent == 2 ? Colors.orange : Colors.white} />
                        </View>
                    </Pressable>
                </View>

                {currSearchComponent == 1 && <UserSearch navigation={navigation}/>}
                {currSearchComponent == 2 && <CardSearch navigation={navigation}/>}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    headerChooseContainer: {
        flexDirection: 'row',
        width: '100%',
        height: 70,
        marginBottom: 10
    },
    headerChoose: {
        width: '50%',
        borderBottomWidth: 1, 
    },
    searchIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    }
})