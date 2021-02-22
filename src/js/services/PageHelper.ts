import {Part} from "../model/Part";

export class PageHelper {
    itemList: HTMLOListElement;
    btnDeleteAll: HTMLButtonElement;

    constructor(listClass) {
        this.itemList = document.querySelector(`.${listClass}`);
        this.btnDeleteAll = document.querySelector('.js-delete-all-btn');
    }

    setMainCheckbox(current: boolean, checkboxes: NodeListOf<HTMLInputElement>) {
        const checkboxMain = document.querySelector('.js-checkbox-main') as HTMLInputElement;

        if (!current) {
            checkboxMain.checked = false;
            return;
        }

        let allIsChecked = true;
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                allIsChecked = false;
                return;
            }
        })
        checkboxMain.checked = allIsChecked;
    }

    uncheckMainCheckbox() {
        const checkboxMain = document.querySelector('.js-checkbox-main') as HTMLInputElement;
        checkboxMain.checked = false;
    }

    uncheckCheckboxes() {
        const checkboxes = document.querySelectorAll('.js-checkbox') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach((checkbox) => checkbox.checked = false);
    }

    getCheckedItems(): string[] {
        const items = Array.from(this.itemList.children);
        const checkedItems = [];

        items.forEach((item: HTMLLIElement) => {
            const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement
            if (checkbox.checked) {
                checkedItems.push(item.dataset.id);
            }
        })
        return checkedItems;
    }

    toggleDeleteAllBtn() {
        const length = this.getCheckedItems().length;

        if (length > 1) {
            this.btnDeleteAll.classList.remove('u-hide');
            return;
        }
        this.btnDeleteAll.classList.add('u-hide');
    }

    hideDeleteAllBtn() {
        this.btnDeleteAll.classList.add('u-hide');
    }


    setConnectBtn(parts: Part[]) {
        const connectPartBtn = document.querySelector('.js-connect-btn') as HTMLButtonElement;
        const title = connectPartBtn.querySelector('.js-connect-btn-title') as HTMLButtonElement;

        if (connectPartBtn) {
            const length = this.getCheckedItems().length;

            if (length > 1) {
                const connectType = this.getConnectType(parts);
                switch (connectType) {
                    case 0:
                        connectPartBtn.classList.add('u-hide');
                        break;
                    case 1:
                        connectPartBtn.classList.remove('u-hide')
                        title.innerText = 'connect';
                        break;
                    case 2:
                        connectPartBtn.classList.remove('u-hide')
                        title.innerText = 'expand';
                        break;
                    case 3:
                        connectPartBtn.classList.remove('u-hide')
                        title.innerText = 'group';
                        break;
                }
                return;
            }
            connectPartBtn.classList.add('u-hide');
        }
    }

    hideConnectBtn() {
        const connectPartBtn = document.querySelector('.js-connect-btn') as HTMLButtonElement;
        connectPartBtn.classList.add('u-hide');
    }

    toggleDisconnectBtn(parts: Part[]) {
        const disconnectPartBtn = document.querySelector('.js-disconnect-btn') as HTMLButtonElement;

        if (disconnectPartBtn) {
            const partsId = this.getCheckedItems();
            const selectedParts = parts.filter(part => partsId.find(id => id === part.id) && part.connect);
            const length = partsId.length;
            const selectedLength = selectedParts.length;

            if (length && length === selectedLength) {
                disconnectPartBtn.classList.remove('u-hide');
                return;
            }

            disconnectPartBtn.classList.add('u-hide');
        }
    }

    hideDisonnectBtn() {
        const disconnectPartBtn = document.querySelector('.js-disconnect-btn') as HTMLButtonElement;
        disconnectPartBtn.classList.add('u-hide');
    }

    handleCheck(callback: CallableFunction = null, parts: Part[] = []) {
        const checkboxes = document.querySelectorAll('.js-checkbox') as NodeListOf<HTMLInputElement>;
        const checkboxMain = document.querySelector('.js-checkbox-main') as HTMLInputElement;

        checkboxMain.addEventListener('change', (ev) => {
            const target = ev.target as HTMLInputElement;
            const checkboxes = document.querySelectorAll('.js-checkbox') as NodeListOf<HTMLInputElement>;
            checkboxes.forEach(checkbox => checkbox.checked = target.checked)

            this.toggleDeleteAllBtn();
            if (parts.length) {
                this.toggleDisconnectBtn(parts)
                this.setConnectBtn(parts);
            }

            if (callback) {
                callback()
            }
        });

        checkboxes.forEach(checkbox =>
            checkbox.addEventListener('change', () => {
                this.setMainCheckbox(checkbox.checked, checkboxes);
                this.toggleDeleteAllBtn();
                if (parts.length) {
                    this.toggleDisconnectBtn(parts)
                    this.setConnectBtn(parts);
                }
                if (callback) {
                    callback()
                }
            }))

    }

    preDeleteItem(partId: string) {
        const item = this.itemList.querySelector(`li[data-id="${partId}"]`) as HTMLLIElement
        item.classList.add('is-deleting');
        item.style.height = item.offsetHeight + 'px';
    }

    deleteItem(partId: string, callback: CallableFunction = null) {
        const item = this.itemList.querySelector(`li[data-id="${partId}"]`) as HTMLLIElement

        setTimeout(() => {
            item.style.height = '0';
            item.classList.add('is-deleted');

            setTimeout(() => {
                item.parentElement.removeChild(item)
                this.toggleDeleteAllBtn();

                if (callback) {
                    callback();
                }

            }, 450)
        }, 250)
    }

    getConnectType(parts: Part[]): number {
        const partsId = this.getCheckedItems()
        const selectedParts = parts.filter(part => partsId.find(id => id === part.id));

        let isNull = false;
        let isDifferentType = false;
        let previewConnect = '';
        let groupVal = 0;

        selectedParts.forEach(part => {
            if (!part.connect) {
                isNull = true;
                return;
            }

            if (previewConnect === part.connect.toString() || !previewConnect) {

                if (!part.connect.priceShare && !part.connect.groupId) {
                    groupVal++;
                }

                if (!previewConnect) {
                    previewConnect = part.connect.toString();
                }
                return;
            }
            isDifferentType = true;
        });

        if (isNull && !isDifferentType) {
            return previewConnect ? 2 : 1;
        }

        if (groupVal === selectedParts.length) {
            return 3;
        }
        return 0;
    }
}