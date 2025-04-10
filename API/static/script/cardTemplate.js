var templateData = new Object(
    [
        {
            property: "fullName",
            position: {
                x: 100,
                y: 200
            },
            style: {
                color: "#c2c2c2",
                fontSize: 24,
                fontWeight: 800
            },
            type: "default",
        },
        {
            property: "localozation",
            position: {
                x: 300,
                y: 400
            },
            style: {
                color: "#c2c2c2",
                fontSize: 20,
                fontWeight: 400
            },
            type: "default",
        },
        {
            property: "phoneNumber",
            position: {
                x: 500,
                y: 150
            },
            style: {
                color: "#c2c2c2",
                fontSize: 16,
                fontWeight: 600
            },
            type: "default",
        },
        {
            property: "email",
            position: {
                x: 900,
                y: 300
            },
            style: {
                color: "#c2c2c2",
                fontSize: 16,
                fontWeight: 500
            },
            type: "default",
        },
    ]
)

var editableTextProperty = templateData[0].property;

function getOverlayTextDataIndex(property) {
    return templateData.findIndex((el) => {
        return el.property == property;
    });
}

const wrapperWidth = document.querySelector('.temaplte-wrapper').clientWidth;
const wrapperHeight = document.querySelector('.temaplte-wrapper').clientHeight;

function displayTemplateData() {
    function updateElementStyles(draggableText, element) {
        if (element.type == "default") {
            draggableText.textContent = `${element.property} is here`;
        } else {
            draggableText.textContent = `${element.content}`;
        }

        const X = wrapperWidth * element.position.x / 1050;
        const Y = wrapperHeight * element.position.y / 600;

        draggableText.style.left = `${X}px`;
        draggableText.style.top = `${Y}px`;

        draggableText.style.color = element.style.color;
        draggableText.style.fontSize = `${element.style.fontSize}px`;
        draggableText.style.fontWeight = element.style.fontWeight;
    }

    let tempalteWrapper = document.querySelector('.temaplte-wrapper');

    templateData.forEach(element => {
        var draggableText;
        let existingElementIdx = Array.from(tempalteWrapper.querySelectorAll('.overlay-text')).findIndex((el) => {
            return el.getAttribute('data-property') == element.property;
        });

        if (existingElementIdx == -1) {
            draggableText = document.createElement('span');
            draggableText.setAttribute('data-property', element.property);
            draggableText.classList.add('overlay-text');
        } else {
            draggableText = tempalteWrapper.querySelectorAll('.overlay-text')[existingElementIdx];
        }
        
        updateElementStyles(draggableText, element);

        if (existingElementIdx == -1) {
            tempalteWrapper.appendChild(draggableText);
            movingTextEvents();
        }
    });
}

var moveElement = {}, offset = {};
function movingTextEvents() {
    // mobile devices support
    const isTouchDevice = () => {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    };

    const events = {
        mouse: {
            down: "mousedown",
            move: "mousemove",
            up: "mouseup"
        },
        touch: {
            down: "touchstart",
            move: "touchmove",
            up: "touchend"
        }
    };

    // check device
    var deviceType = "";
    try {
        document.createEvent("TouchEvent");
        deviceType = "touch";
    } catch (e) {
        deviceType = "mouse";
    }

    // display text
    displayTemplateData();

    // bind drag events
    document.querySelector('.temaplte-wrapper').querySelectorAll('.overlay-text').forEach((draggableElem) => {
        
        // mouse down (movement start)
        draggableElem.addEventListener(events[deviceType].down, (e) => {
            e.preventDefault();
            editableTextProperty = e.target.getAttribute('data-property');
            updateEditPanel(e.target.getAttribute('data-property'));

            offset[this] = {
                x: draggableElem.offsetLeft - (!isTouchDevice() ? e.clientX : e.touches[0].clientX),
                y: draggableElem.offsetTop - (!isTouchDevice() ? e.clientY : e.touches[0].clientY)
            }

            moveElement[this] = true;
        }, true);

        // move
        draggableElem.addEventListener(events[deviceType].move, (e) => {
            e.preventDefault();
            if (moveElement[this]) {
                const minX = 0;
                const minY = 0;
                const maxX = wrapperWidth - e.target.offsetWidth;
                const maxY = wrapperHeight - e.target.offsetHeight;

                const globalMouseX = (!isTouchDevice() ? e.clientX : e.touches[0].clientX);
                const globalMouseY = (!isTouchDevice() ? e.clientY : e.touches[0].clientY);

                var newX = Math.max(minX, Math.min(globalMouseX + offset[this].x, maxX));
                var newY = Math.max(minY, Math.min(globalMouseY + offset[this].y, maxY));
    
                e.target.style.left = newX + 'px';
                e.target.style.top = newY + 'px';
            }
        }, true);

        // mouse up (movement end)
        draggableElem.addEventListener(events[deviceType].up, (e) => {
            const templateDataIdx = getOverlayTextDataIndex(draggableElem.getAttribute('data-property'));

            let X = 1050 * parseFloat(draggableElem.style.left) / wrapperWidth;
            let Y = 600 * parseFloat(draggableElem.style.top) / wrapperHeight;

            templateData[templateDataIdx].position.x = X;
            templateData[templateDataIdx].position.y = Y;
            //console.log(X, Y);

            moveElement[this] = false;
        }, true);
    })
}


document.querySelector('#temaplte-form__background-input').addEventListener('change', (event) => {
    const backgroundImageURL = event.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
        const image = new Image();
        image.src = e.target.result;

        image.onload = () => {
            const { height, width } = image;
            if (height != 600 || width != 1050) {
                event.target.value = '';
                alert("Height must equals 600px and Width must equals 1050px.");
                
              return false;
            }

            document.querySelector('.template-preview__background-image').setAttribute('src', e.target.result);            
            return true;
        };
    }

    reader.readAsDataURL(backgroundImageURL);
})


// edit card text
function updateEditPanel(property) {
    const templateDataIdx = getOverlayTextDataIndex(property);

    if (templateData[templateDataIdx].type == "additional") {
        document.querySelector('#content__input').value = templateData[templateDataIdx].content;
        document.querySelector('.content__input-wrapper').style.display = 'flex';
    } else {
        document.querySelector('.content__input-wrapper').style.display = 'none';
    }

    document.querySelector('#edilable-property').textContent = property;

    document.querySelector('#font-size__input').value = templateData[templateDataIdx].style.fontSize;
    document.querySelector('#font-size__numeric-input').value = templateData[templateDataIdx].style.fontSize;

    document.querySelector('#font-weight__numeric-input').value = templateData[templateDataIdx].style.fontWeight;
    document.querySelector('#font-weight__input').value = templateData[templateDataIdx].style.fontWeight;

    document.querySelector('#color__input').value = templateData[templateDataIdx].style.color;
}


document.querySelector('#font-size__input').addEventListener('input', (e) => {
    const templateDataIdx = getOverlayTextDataIndex(editableTextProperty);

    templateData[templateDataIdx].style.fontSize = parseInt(e.target.value);
    displayTemplateData();
    updateEditPanel(editableTextProperty);
});

document.querySelector('#font-size__numeric-input').addEventListener('input', (e) => {
    const templateDataIdx = getOverlayTextDataIndex(editableTextProperty);

    let val = Math.round(parseInt(e.target.value));
    if (val > 25) val = 25;
    else if (val < 3) val = 3;
    templateData[templateDataIdx].style.fontSize = val;

    displayTemplateData();
    updateEditPanel(editableTextProperty);
});

document.querySelector('#font-weight__input').addEventListener('input', (e) => {
    const templateDataIdx = getOverlayTextDataIndex(editableTextProperty);

    templateData[templateDataIdx].style.fontWeight = parseInt(e.target.value);
    displayTemplateData();
    updateEditPanel(editableTextProperty);
});

document.querySelector('#font-weight__numeric-input').addEventListener('input', (e) => {
    const templateDataIdx = getOverlayTextDataIndex(editableTextProperty);

    let val = Math.round(parseInt(e.target.value));
    if (val > 900) val = 900;
    else if (val < 200) val = 200;
    templateData[templateDataIdx].style.fontWeight = val;
    
    displayTemplateData();
    updateEditPanel(editableTextProperty);
});

document.querySelector('#color__input').addEventListener('input', (e) => {
    const templateDataIdx = getOverlayTextDataIndex(editableTextProperty);

    templateData[templateDataIdx].style.color = e.target.value;
    displayTemplateData();
});

document.querySelector('#content__input').addEventListener('input', (e) => {
    const templateDataIdx = getOverlayTextDataIndex(editableTextProperty);

    templateData[templateDataIdx].content = e.target.value;
    displayTemplateData();
})

document.querySelector('#add-additional-text-button').addEventListener('click', () => {
    editableTextProperty = `additionalText_${templateData.length}`;
    templateData.push({
        property: editableTextProperty,
        position: {
            x: 0,
            y: 0
        },
        style: {
            color: "#c2c2c2",
            fontSize: 20,
            fontWeight: 500
        },
        type: "additional",
        content: "Additional text"
    });

    updateEditPanel(editableTextProperty);
    displayTemplateData();
})

document.querySelector('#delete-text-button').addEventListener('click', () => {
    templateData = templateData.filter((el) => {
        return el.property != editableTextProperty;
    })

    var elements = document.querySelectorAll('span[data-property]');

    elements.forEach(function(element) {
        if (element.getAttribute('data-property') == editableTextProperty) {
            element.remove();
        }
    });

    if (templateData.length) {
        editableTextProperty = templateData[0].property;
        updateEditPanel(editableTextProperty);
    }

    displayTemplateData();
})



// initial settings
window.addEventListener('load', () => {
    if (document.querySelector('#temaplte-form__template-data-input').value) {
        templateData = JSON.parse(document.querySelector('#temaplte-form__template-data-input').value);
    }

    movingTextEvents();
    updateEditPanel(templateData[0].property);
});

// form submit
document.querySelector('.card-temaplte-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    document.querySelector('#temaplte-form__template-data-input').value = JSON.stringify(templateData);

    document.querySelector('.card-temaplte-form').submit();
})
