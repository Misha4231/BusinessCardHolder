import { Text, StyleSheet, View, LogBox, PanResponder } from "react-native";
import { useRef, useState, useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Colors } from "../../globalStyles/GlobalStyles";

export default function DraggableText({ templateJson, templateDataIdx, setTemplateJson, textContent, borders, currEditablePropertyIdx, setCurrEditablePropertyIdx }) {
    const [dragging, setDragging] = useState(false);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        if (borders.imageEndX && borders.imageEndY) {
            translateX.value = borders.imageEndX * templateJson.templateData[templateDataIdx].position.x / 1050;
            translateY.value = borders.imageEndY * templateJson.templateData[templateDataIdx].position.y / 600;
        }
    }, [borders]);

    const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setDragging(true);
                setCurrEditablePropertyIdx(templateDataIdx);
            },
            onPanResponderMove: (_, gestureState) => {
                const nextTranslateX = gestureState.moveX - borders.WrapperPageMinX;
                const nextTranslateY = gestureState.moveY - borders.WrapperPageMinY;

                if (
                    nextTranslateX >= borders.imageStartX &&
                    nextTranslateY >= borders.imageStartY &&
                    nextTranslateX <= borders.imageEndX - 10 &&
                    nextTranslateY <= borders.imageEndY - 20
                ) {
                    translateX.value = nextTranslateX;
                    translateY.value = nextTranslateY;
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                setDragging(false);
                const textX = gestureState.moveX - borders.WrapperPageMinX;
                const textY = gestureState.moveY - borders.WrapperPageMinY;

                const updatedTemplateState = { ...templateJson };
                const updatedTemplateData = [...updatedTemplateState.templateData];
                
                updatedTemplateData[templateDataIdx] = {
                    ...updatedTemplateData[templateDataIdx],
                    position: {
                        x: 1050.0 * textX / borders.imageEndX,
                        y: 600 * textY / borders.imageEndY,
                    }
                };

                updatedTemplateState.templateData = updatedTemplateData;
                setTemplateJson(updatedTemplateState);
            },
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: withSpring(translateX.value, { damping: 50, stiffness: 250 }) },
                { translateY: withSpring(translateY.value, { damping: 50, stiffness: 250 }) },
            ],
        };
    });

    function getStyles() {
        let styles = {};

        styles.fontSize = templateJson.templateData[templateDataIdx].style.fontSize;
        styles.fontWeight = Math.round((templateJson.templateData[templateDataIdx].style?.fontWeight) / 100) * 100;
        styles.color = templateJson.templateData[templateDataIdx].style?.color;

        return styles;
    }


    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                styles.draggable,
                animatedStyle,
            ]}
        >
            {templateDataIdx == currEditablePropertyIdx && <View style={{position: 'relative'}}>
                <View style={[styles.circle, styles.topLeft]}></View>
                <View style={[styles.circle, styles.topRight]}></View>
            </View>}
            
            <Text style={[templateDataIdx === currEditablePropertyIdx && styles.draggableBorder, getStyles()]}>{textContent}</Text>

            {templateDataIdx == currEditablePropertyIdx && <View style={{position: 'relative'}}>
                <View style={[styles.circle, styles.bottomLeft]}></View>
                <View style={[styles.circle, styles.bottomRight]}></View>
            </View>}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    draggable: {
        position: 'absolute',
        backgroundColor: 'transparent',
        zIndex: 2,
    },

    draggableBorder: {
        borderWidth: 2,
        borderColor: Colors.blue,
        borderStyle: 'dashed'
    },
    circle: {
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: Colors.blue,
        position: 'absolute',
        zIndex: 1100
    },
    topLeft: {
        top: -5,
        left: -5,
    },
    topRight: {
        top: -5,
        right: -5,
    },
    bottomLeft: {
        bottom: -5,
        left: -5,
    },
    bottomRight: {
        bottom: -5,
        right: -5,
    },
})