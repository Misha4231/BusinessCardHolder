import { View, TextInput, Pressable, Text } from "react-native";
import { useContext, useState } from "react";

import GlobalStyles, {Colors} from "../globalStyles/GlobalStyles"
import CardsList from "./CardsList";


export default function CardSearch({ navigation }) {
    const [searchedCards, setSearchedCards] = useState([]);
    
    function HeaderComponent() {
        return (
            <View></View>
        )
    }

    return (
        
                
            <CardsList apiEndpoint={'/api/cards/search?'} navigation={navigation} cards={searchedCards} setCards={setSearchedCards} HeaderComponent={HeaderComponent} />
        
    )
}