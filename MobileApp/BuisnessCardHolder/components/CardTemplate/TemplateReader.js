export default class TemplateReader {
    #templateJson;
    #minX;
    #minY;
    #maxX;
    #maxY;

    constructor(templateJson, screenSettings = null) {
        this.#templateJson = templateJson;

        if (!screenSettings) {
            this.#minX = 0;
            this.#minY = 0;
            this.#maxX = 300;
            this.#maxY = 170;
            this.WrapperPageMinX = 0;
            this.WrapperPageMinY = 0;
            this.WrapperPageMaxX = 0;
            this.WrapperPageMaxY = 0;
        }
        else {
            this.#minX = screenSettings.minX;
            this.#minY = screenSettings.minY;
            this.#maxX = screenSettings.maxX;
            this.#maxY = screenSettings.maxY;
            this.WrapperPageMinX = screenSettings.WrapperPageMinX;
            this.WrapperPageMinY = screenSettings.WrapperPageMinY;
            this.WrapperPageMaxX = screenSettings.WrapperPageMaxX;
            this.WrapperPageMaxY = screenSettings.WrapperPageMaxY;
        }
    }
    screenSettings() {
        return {
            minX: this.#minX,
            minY: this.#minY,
            maxX: this.#maxX,
            maxY: this.#maxY,
            WrapperPageMinX: this.WrapperPageMinX,
            WrapperPageMinY: this.WrapperPageMinY,
            WrapperPageMaxX: this.WrapperPageMaxX,
            WrapperPageMaxY: this.WrapperPageMaxY,
        }
    }

    onLayoutHandler(event) {
        const { width, height, x, y } = event.nativeEvent.layout;
        
        this.#minX = 0;
        this.#minY = 0;
        this.#maxX = width;
        this.#maxY = height;
    }

    getBackground() {
        return this.#templateJson['background'];
    }
    getTemplateData() {
        return this.#templateJson['templateData'];
    }
    getTemplateJson() {
        return this.#templateJson;
    }
    getCourners() {
        return {minX: this.#minX, minY: this.#minY, maxX: this.#maxX, maxY: this.#maxY}
    }
    getPropertyStyles(property) {
        let styles = {};
        const propertyIdx = this.getPropertyIdx(property);
        if (propertyIdx == -1) return styles;

        styles.left = Math.min(this.#maxX, Math.max(this.#minX, this.#maxX * this.#templateJson['templateData'][propertyIdx].position.x / 1050));
        styles.top = Math.min(this.#maxY, Math.max(this.#minY, this.#maxY * this.#templateJson['templateData'][propertyIdx].position.y / 600));
       
        styles.fontSize = this.#templateJson['templateData'][propertyIdx].style.fontSize;
        styles.fontWeight = Math.round((this.#templateJson['templateData'][propertyIdx].style?.fontWeight) / 100) * 100;
        styles.color = this.#templateJson['templateData'][propertyIdx].style?.color;

        return styles;
    }
    getPropertyPosition(property) {
        const propertyIdx = this.getPropertyIdx(property);
        if (propertyIdx == -1) return {x: 0, y: 0};

        //console.log(this.#maxX, this.#maxY, this.#minX, this.#minY);
        //const x = min(this.#maxX, max(this.#minX, this.#maxX * this.#templateJson['templateData'][propertyIdx].position.x / 1050));
        
        return {
            x: Math.min(this.#maxX, Math.max(this.#minX, this.#maxX * this.#templateJson['templateData'][propertyIdx].position.x / 1050.0)),
            y: Math.min(this.#maxY, Math.max(this.#minY, this.#maxY * this.#templateJson['templateData'][propertyIdx].position.y / 600.0))
        };
    }
    getPropertyTextStyle(property) {
        let styles = {};
        const propertyIdx = this.getPropertyIdx(property);
        if (propertyIdx == -1) return styles;
       
        styles.fontSize = this.#templateJson['templateData'][propertyIdx].style.fontSize;
        styles.fontWeight = Math.round((this.#templateJson['templateData'][propertyIdx].style?.fontWeight) / 100) * 100;
        styles.color = this.#templateJson['templateData'][propertyIdx].style?.color;

        return styles;
    }
    onPropertyDragRelease(property, gestureState) {
        const propertyIdx = this.getPropertyIdx(property);

        let newX = gestureState.moveX - this.WrapperPageMinX;
        let newY = gestureState.moveY - this.WrapperPageMinY;
        
        this.#templateJson['templateData'][propertyIdx].position.x = this.#minX, 1050.0 * newX / this.#maxX;
        this.#templateJson['templateData'][propertyIdx].position.y = this.#minY, 600.0 * newY / this.#maxY;
    }
    getPropertyIdx(property) {
        return this.#templateJson['templateData'].findIndex((el) => {
            return el.property == property;
        })
    }
    updateFontSize(idx, newFontSize) {
        this.#templateJson['templateData'][idx].style.fontSize = newFontSize;
    }
    updateFontWeight(idx, newFontWeight) {
        this.#templateJson['templateData'][idx].style.fontWeight = newFontWeight;
    }
    updateColor(idx, newColor) {
        this.#templateJson['templateData'][idx].style.color = newColor;
    }
    updateFontFamily(idx, newFontFamily) {
        this.#templateJson['templateData'][idx].style.fontFamily = newFontFamily;
    }
    deleteProperty(idx) {
        this.#templateJson['templateData'].splice(idx, 1);
    }
    getAdditionalTextContent(idx) {
        if (this.#templateJson['templateData'][idx]?.type == 'additional') {
            return this.#templateJson['templateData'][idx].content;
        } 
        return null;
    }
    updateAdditionalTextContent(idx, newContent) {
        if (this.#templateJson['templateData'][idx]?.type == 'additional') {
            this.#templateJson['templateData'][idx].content = newContent;
        }
    }
    addAdditionalText() {
        let maxIdx = 0;
        this.#templateJson['templateData'].forEach(element => {
            if (element.type == 'additional') {
                maxIdx = Math.max(maxIdx, parseInt(element.property.split('_')[1]));
            }
        });

        newProperty = `additionalText_${maxIdx + 1}`;
        this.#templateJson['templateData'].push({
            property: newProperty,
            position: {
                x: 0,
                y: 0
            },
            style: {
                color: "#c2c2c2",
                fontSize: 15,
                fontWeight: 500
            },
            type: "additional",
            content: "Additional text"
        })

        return newProperty;
    }
}