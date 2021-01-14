class CoursView {
    constructor() {
        this.courseList = document.querySelector('#exchange_rates');
    }

   
    renderCours(ccy, base_ccy, buy, sale) {
        let li = document.createElement("li");
        let currency = document.createElement("h3");
        let course = document.createElement("p");

        currency.innerText = ccy;     
        course.innerText = `Продажа: ${(buy*1).toFixed(2)}${base_ccy} / Покупка: ${(sale*1).toFixed(2)}${base_ccy}`;

        this.courseList.appendChild(li);
        li.append(currency, course);       
    }


    courseError(msg) {
        this.clearCourse();
        let li = document.createElement("li");
        li.innerText = `Ошибка: ${msg}`;
        this.courseList.appendChild(li);
    }


    clearCourse() {
        this.courseList.innerHTML = '';
    }
}



class CoursModel {
    constructor() {
        this.courses = [];
    }


    setCourses(courses) {
        this.courses = courses;
    }


    clear() {
        this.courses = [];
    }
}



class CoursControler {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.loadCourse = this.loadCourse;
    }


    handle() {
        this.loadCourse();
        setInterval(this.loadCourse, 3600000);
    }


    loadCourse = () => {
        this.model.clear();
        fetch('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
            .then(res => res.json())
            .then(result => {
                this.model.setCourses(result);
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                this.view.clearCourse();
                if(this.model.courses.length === 0) return this.view.courseError('Нет данных');
                this.model.courses.forEach(item => this.view.renderCours(item.ccy, item.base_ccy, item.buy, item.sale))
            });
    }

}


const coursView = new CoursView();
const coursModel = new CoursModel();
const coursController = new CoursControler(coursModel, coursView);

coursController.handle();