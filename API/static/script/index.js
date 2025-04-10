var according = document.querySelectorAll('.faq-accordion');
var i;

for (i = 0; i < according.length; i++) {
    according[i].addEventListener('click', (event) => {
        event.target.classList.toggle('faq-accordion-active');
        event.target.parentElement.classList.toggle('faq-active');
        
        var panel = event.target.parentElement.querySelector('.faq-panel');

        if (panel.style.display == 'block') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
        }
    })

}