import {Car} from "../model/Car";
import {CarService} from "../services/CarService";
import {Routing} from "../services/Routing";

export class Home {
    private homePage: HTMLDivElement;
    private carService: CarService;
    private readonly routing: Routing;

    constructor(carService: CarService, routing: Routing) {
        this.routing = routing;
        this.carService = carService;
        this.init();
    }

    private init() {
        this.homePage = document.querySelector('.js-menu-page');
        this.routing.setBack();

        if (!this.homePage) {
            return;
        }

        document.title = `Service Base`;
        this.createMenu();
        this.clickListener();
    }

    private createMenu() {

        let carHtml = '';
        this.carService.getCars().forEach(car => carHtml += Home.createItem(car));

        let navHTML = `<nav class="l-menu js-menu">${carHtml}</nav>
        <button class="o-btn-more">
            <span class="o-btn-more__dot"></span>
            <span class="o-btn-more__dot"></span>
            <span class="o-btn-more__dot"></span>
        </button>`

        this.homePage.insertAdjacentHTML("beforeend", navHTML);
    }

    private static createItem(car: Car): string {
        const imgUrl = `https://service-base-api.es3d.pl/uploads/images/${car.image}`;

        return `<button data-id = "${car.id}" class="o-btn-menu js-btn-menu">    
                    <svg class="o-ico" viewBox="0 0 179 120" xmlns="http://www.w3.org/2000/svg">
                        <path d="M176.017 48C174.898 46.125 163.856 41.3288 163.856 41.3288C165.776 40.3313 167.089 40.125 167.089 36C167.089 31.5 167.067 30 164.083 30H153.962C153.921 29.91 153.877 29.8162 153.836 29.7225C147.302 15.375 146.426 11.7487 136.681 6.86625C123.611 0.329999 99.1063 0 89.5 0C79.8937 0 55.3893 0.329999 42.3298 6.86625C32.5743 11.7412 32.8167 14.25 25.1756 29.7225C25.1756 29.7637 25.0973 29.8725 25.0264 30H14.8943C11.9333 30 11.911 31.5 11.911 36C11.911 40.125 13.2236 40.3313 15.1441 41.3288C15.1441 41.3288 4.475 46.5 2.98333 48C1.49167 49.5 0 60 0 78C0 96 1.49167 114 1.49167 114H5.94429C5.94429 119.25 6.7125 120 8.95 120H38.7833C41.0208 120 41.7667 119.25 41.7667 114H137.233C137.233 119.25 137.979 120 140.217 120H170.796C172.288 120 173.033 118.875 173.033 114H177.508C177.508 114 179 95.625 179 78C179 60.375 177.135 49.875 176.017 48ZM40.7449 64.8525C33.953 65.5992 27.1264 65.9822 20.2941 66C12.6792 66 12.4181 66.4912 11.8811 61.71C11.6791 59.5216 11.743 57.3166 12.0713 55.1438L12.3062 54H13.425C17.9 54 22.1028 54.1912 30.0384 56.5425C34.0746 57.7604 37.8709 59.671 41.2595 62.19C42.8854 63.375 43.2583 64.5 43.2583 64.5L40.7449 64.8525ZM132.915 91.8525L131.267 96H47.7333C47.7333 96 47.8788 95.7713 45.8688 91.8075C44.3771 88.875 46.2417 87 49.1914 85.935C54.9045 83.865 71.6 78 89.5 78C107.4 78 124.427 83.055 129.961 85.935C132.012 87 134.56 87.75 132.915 91.875V91.8525ZM37.0754 40.6538C35.8708 40.7236 34.6635 40.7324 33.4581 40.68C34.4314 38.94 34.9721 37.0012 35.9231 34.9762C38.9064 28.6012 42.3186 21.3862 48.3934 18.345C57.1719 13.95 75.3665 11.97 89.5 11.97C103.634 11.97 121.828 13.935 130.607 18.345C136.681 21.3862 140.079 28.605 143.077 34.9762C144.035 37.02 144.569 38.9738 145.568 40.725C144.822 40.7663 143.964 40.725 141.917 40.6538H37.0754ZM166.746 61.695C165.948 66.375 166.694 66 158.706 66C151.874 65.9822 145.047 65.5992 138.255 64.8525C137.192 64.6613 136.89 62.8575 137.74 62.19C141.112 59.643 144.913 57.7298 148.962 56.5425C156.897 54.1912 161.365 53.8762 165.776 54.0337C166.073 54.0451 166.354 54.1663 166.567 54.374C166.78 54.5817 166.909 54.8612 166.929 55.1587C167.139 57.3416 167.078 59.5424 166.746 61.71V61.695Z"/>
                    </svg>
                   <img class="o-btn-menu__image" src="${imgUrl}" alt="no brum brum">
                    <div class="o-btn-menu__title">
                        <h2 class="o-title-l1--simple">${car.fullName()}</h2>
                        <div class="u-d-flex u-mt--sm">
                            <span class="o-title-l2--simple">${car.engine}</span>
                            <div class="u-spacer"></div>
                            <span class="o-title-l2--simple">${car.year} r</span>
                        </div>
                    </div>
                </button>`;
    }

    private clickListener() {
        const menuButtons = this.homePage.querySelector('.js-menu').childNodes as NodeListOf<HTMLButtonElement>;

        menuButtons.forEach(button => {
            button.addEventListener('click', (ev) => (this.select(ev)));
        })
    }

    private select(ev: MouseEvent) {
        ev.preventDefault();
        const btn = ev.currentTarget as HTMLButtonElement;

        this.routing.goDetails(btn.dataset.id);
    }
}