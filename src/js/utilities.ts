export function shortFormatDate(date) {
    return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}
    ${addZero(date.getHours())}:${addZero(date.getMinutes())}`
}

export function toFileFormatDate(date) {
    return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}T${addZero(date.getHours())}:${addZero(date.getMinutes())}`
}

export function toggleDisableBtn(btn, condition1, condition2) {
    if (condition1 && condition2) {
        btn.removeAttribute('disabled');
    } else {
        btn.setAttribute('disabled', 'true');
    }
}

export function roundNumber(amount) {
    return Math.floor(amount * 100) / 100;
}

export function formatAmount(amount) {
    let number = +amount;
    return number.toFixed(2);
}

function addZero(txt) {
    txt = String(txt).length === 1 ? `0${txt}` : txt;
    return txt;
}

export function slideUp(element) {
    const maxHeight = element.firstElementChild.offsetHeight;
    const time = 250;
    let timer = null;

    element.classList.remove('is-open');
    element.style.height = maxHeight + 'px';

    clearInterval(timer);

    const instanceHeight = parseInt(element.style.height);
    const init = (new Date()).getTime();
    const height = 0;
    const display = height - parseInt(element.style.height);

    timer = setInterval(() => {

        let instance = (new Date()).getTime() - init;
        if (instance <= time) {
            let pos = instanceHeight + Math.floor(display * instance / time);
            element.style.height = pos + 'px';
        } else {
            element.removeAttribute('style')
            clearInterval(timer);
        }
    }, 20);
}

export function slideDown(element) {
    element.classList.add('is-open');
    element.style.height = '0px';

    const maxHeight = element.firstElementChild.offsetHeight;
    const time = 250;
    let timer = null;

    clearInterval(timer);

    const instanceHeight = parseInt(element.style.height);
    const init = (new Date()).getTime();
    const display = maxHeight - parseInt(element.style.height);

    timer = setInterval(() => {

        let instance = (new Date()).getTime() - init;
        if (instance <= time) {
            let pos = instanceHeight + Math.floor(display * instance / time);
            element.style.height = pos + 'px';
        } else {
            element.style.height = '100%';
            clearInterval(timer);
        }
    }, 20);
}

export function slideToggle(element) {
    const slider = element;
    const isOpen = element.style.height === '100%'
    const maxHeight = element.firstElementChild.offsetHeight;
    const time = 250;
    let timer = null;
    clearInterval(timer);

    const init = (new Date()).getTime();
    let height = isOpen ? 0 : maxHeight;

    if (isOpen) {
        element.classList.remove('is-open');
        slider.style.height = maxHeight + 'px';
    } else {
        element.classList.add('is-open');
        slider.style.height = '0px';
    }

    const instanceHeight = parseInt(slider.style.height);
    const display = height - parseInt(slider.style.height);

    timer = setInterval(() => {
        let instance = (new Date()).getTime() - init;
        if (instance <= time) {
            let pos = instanceHeight + Math.floor(display * instance / time);
            slider.style.height = pos + 'px';
        } else {
            isOpen ? slider.removeAttribute('style') : slider.style.height = '100%';
            clearInterval(timer);
        }
    }, 20);
}

export function slideReset(current) {
    const items = document.querySelectorAll('.js-slide-reset');
    let anyOpen = false;

    items.forEach(item => {
        if (item.classList.contains('is-open') && item !== current) {
            anyOpen = true;
            slideUp(item);
        }
    })
    setTimeout(() => {
        if (current) {
            slideToggle(current);
        }
    }, anyOpen ? 250 : 0)
}

export function getStringDate(date: Date): string {
    return `${addZeroInDate(date.getDate())}.${addZeroInDate(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export function getDateFromString(stringDate: string): Date {
    let date = new Date();
    date.setDate(+(stringDate.split('.')[0]));
    date.setMonth(+(stringDate.split('.')[1]) - 1);
    date.setFullYear(+(stringDate.split('.')[2]));

    return date;
}

export function addZeroInDate(number: number): string {
    return number < 10 ? `0${number}` : number.toString();
}

export function addIcons() {
    document.querySelectorAll('.ico').forEach((ico: HTMLSpanElement) => {
        const icoName = (ico.classList.value.split(' ')[1]);
        const svg = require(`!svg-inline-loader!../images/svg/${icoName}.svg`);

        let html = new DOMParser().parseFromString(svg, 'text/html').body.firstChild as HTMLElement;
        html.classList.add('o-ico')
        ico.replaceWith(html);

    })
}

export function hideWindow(): Promise<null> {
    return new Promise(resolve => {
        const pages = document.querySelectorAll('.js-pages > div:not(.u-hide)') as NodeListOf<HTMLDivElement>;

        if (!pages.length) {
            resolve();
        }

        pages.forEach(page => {
            page.classList.add('u-is-hidden');
            setTimeout(args => {
                page.classList.add('u-hide')
                page.innerHTML = '';
                page.classList.remove('u-is-hidden');
                resolve();
            }, 250);
        })
    })
}

export function showWindow(window): Promise<null> {
    return new Promise(resolve => {

        window.classList.remove('u-hide')
        window.classList.add('u-is-showing');
        setTimeout(args => {
            window.classList.remove('u-is-showing');

            resolve();
        }, 250);
    })
}

export function addHistory(href: string) {
    if (!(window.history && history.pushState)) {
        return;
    }
}

export function getParValueFromUrl(name: string): string {

    const parameters = window.location.search
        .substring(1)
        .split('&');

    let value = null;

    parameters.forEach(parameter => {
        const tmp = parameter.split('=');
        
        if(tmp[0]===name){
            value= tmp[1];
        }
    })
    return value;
}