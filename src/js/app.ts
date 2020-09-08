import '../scss/app.scss';

import '@fortawesome/fontawesome-free/js/all.min';
import {Menu} from "./components/Menu";

new Menu();

document.querySelectorAll('.ico').forEach((ico: HTMLSpanElement) => {
    const icoName = (ico.classList.value.split(' ')[1]);
    const svg = require(`!svg-inline-loader!../images/svg/${icoName}.svg`);

    let html = new DOMParser().parseFromString(svg, 'text/html').body.firstChild as HTMLElement;
    html.classList.add('o-ico')
    ico.replaceWith(html);

})

