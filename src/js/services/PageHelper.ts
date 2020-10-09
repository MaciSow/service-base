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

    getCheckedItems(): number[] {
        const items = Array.from(this.itemList.children);
        const checkedItems = [];

        items.forEach((item: HTMLLIElement) => {
            const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement
            if (checkbox.checked) {
                checkedItems.push(+item.dataset.id);
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

    handleDeleteAll(callback: CallableFunction) {
        this.btnDeleteAll.addEventListener('click', () => {
            const parts = Array.from(this.itemList.children);
            
            parts.forEach((part: HTMLLIElement) => {
                const checkbox = part.querySelector('input[type="checkbox"]') as HTMLInputElement
                if (checkbox.checked) {
                    const partId = part.dataset.id;
                    if (partId) {
                        callback(part);
                    }
                }
            })
        })
    }


    handleCheck(callback: CallableFunction = null) {
        const checkboxes = document.querySelectorAll('.js-checkbox') as NodeListOf<HTMLInputElement>;
        const checkboxMain = document.querySelector('.js-checkbox-main') as HTMLInputElement;

        checkboxMain.addEventListener('change', (ev) => {
            const target = ev.target as HTMLInputElement;
            const checkboxes = document.querySelectorAll('.js-checkbox') as NodeListOf<HTMLInputElement>;
            checkboxes.forEach(checkbox => checkbox.checked = target.checked)

            this.toggleDeleteAllBtn()

            if (callback){
                callback()
            }
        });

        checkboxes.forEach(checkbox =>
            checkbox.addEventListener('change', () => {
                this.setMainCheckbox(checkbox.checked, checkboxes)
                this.toggleDeleteAllBtn()
                if (callback){
                    callback()
                }
            }))

    }


    preDeleteItem(partId: number) {
        const item = this.itemList.querySelector(`li[data-id="${partId}"]`) as HTMLLIElement
        item.classList.add('is-deleting');
        item.style.height = item.offsetHeight + 'px';
    }

    deleteItem(partId: number, callback:CallableFunction = null) {
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


}