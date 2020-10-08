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

    getCheckedParts(): number[] {
        const parts = Array.from(this.itemList.children);
        const checkedParts = [];

        parts.forEach((part: HTMLLIElement) => {
            const checkbox = part.querySelector('input[type="checkbox"]') as HTMLInputElement
            if (checkbox.checked) {
                checkedParts.push(+part.dataset.id);
            }
        })
        return checkedParts;
    }

    toggleDeleteAllBtn() {
        const length = this.getCheckedParts().length;

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

    preDeletingItem(part: HTMLLIElement) {
        part.classList.add('is-deleting');
        part.style.height = part.offsetHeight + 'px';
    }

    deletingItem(part: HTMLLIElement) {
        part.style.height = '0';
        part.classList.add('is-deleted');
    }

    postDeletingItem(part: HTMLLIElement) {
        part.parentElement.removeChild(part)
        this.toggleDeleteAllBtn();
    }

    handleCheck(callback?: CallableFunction) {
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

}