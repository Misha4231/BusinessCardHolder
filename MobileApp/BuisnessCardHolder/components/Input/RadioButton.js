import { View, Pressable } from "react-native";
import { Colors } from "../../globalStyles/GlobalStyles";

export default function RadioButton({ isActive, onChoose }) {
    return (
        <Pressable onPress={onChoose} style={[
            { height: 18, width: 18, borderRadius: 12, borderWidth: 2, borderColor: Colors.blue, alignItems: 'center', justifyContent: 'center'}
        ]}>
            {isActive && 
                <View style={{height: 10, width: 10, borderRadius: 6, backgroundColor: Colors.blue}}></View>
            }
        </Pressable>
    )
}