var wrapperWidth = document.querySelector('.templates-list__view').clientWidth;
var wrapperHeight = document.querySelector('.templates-list__view').clientHeight;


window.addEventListener('load', () => {
    wrapperWidth = document.querySelector('.templates-list__view').clientWidth;
    wrapperHeight = document.querySelector('.templates-list__view').clientHeight;

    document.querySelectorAll('.templates-list__view').forEach((templateWrapper) => {
        var templateData = JSON.parse(templateWrapper.getAttribute('data-template'));
        

        displayTemplateData(templateWrapper, templateData);
    })
})

function displayTemplateData(templateWrapper, templateData) {
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

    templateData.forEach(element => {
        var draggableText = document.createElement('span');
        draggableText.setAttribute('data-property', element.property);
        draggableText.classList.add('overlay-text', 'not-movable');
        
        updateElementStyles(draggableText, element);

        templateWrapper.appendChild(draggableText);
    });
}

document.querySelectorAll('.delete-template-button').forEach((button) => {
    button.addEventListener('click', (e) => {
        let templateId = e.target.getAttribute('data-id');
        
        let options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                templateId: templateId
            })
        };

        fetch('/admin/delete_template', options).then(response => {
            if (response.ok) document.querySelector(`#template-${templateId}`).remove();
        })
    })
})