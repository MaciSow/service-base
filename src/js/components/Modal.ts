import {addIcons} from "../utilities";

export class Modal {
    private title: string;
    private content: string;


    constructor(title: string, content: string) {
        this.title = title;
        this.content = content;
        this.init();
    }

    private init() {
        this.createWindow();
        this.eventListeners();
        addIcons();
    }

    private createWindow() {
        const body = document.querySelector('body');

        const menageHTML = `<div class="c-modal-backdrop u-is-showing js-menage-window">          
                                <div class="c-modal">
                                    <button class="o-btn-ico--delete c-modal__close js-menage-close"><i class="ico Xdelete"></i></button>
                                    <h2 class="o-title-l1--center">${this.title}</h2>
                                    ${this.content}
                                </div>
                           </div>`;

        body.insertAdjacentHTML('beforeend', menageHTML);
        this.showWindow();
    }

    private eventListeners() {
        const btnClose = document.querySelector('.js-menage-close');

        btnClose.addEventListener('click', () => this.handleClose());
    }

    private handleClose() {
        Modal.hideWindow().then();
    }


    private showWindow() {
        const window = document.querySelector('.js-menage-window');

        setTimeout(() => {
            window.classList.remove('u-is-showing');
        }, 250);
    }

    static hideWindow(): Promise<null> {
        return new Promise((resolve) => {
            const window = document.querySelector('.js-menage-window');
            window.classList.add('u-is-hidden');
            setTimeout(() => {
                window.remove();
                resolve();
            }, 250);
        });
    }


}