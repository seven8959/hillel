// class CoursView {
//     constructor() {
//         this.courseList = document.querySelector('#exchange_rates');
//     }

   
//     renderCours(ccy, base_ccy, buy, sale) {
//         let li = document.createElement("li");
//         let currency = document.createElement("h3");
//         let course = document.createElement("p");
//         let courseUsd = document.querySelector('.usd');
//         let courseEuro = document.querySelector('.euro');
//         let courseRur = document.querySelector('.rur');
//         let courseBtc = document.querySelector('.btc');
        
//         currency.innerText = ccy;     
//         course.innerText = `Продажа: ${(buy*1).toFixed(2)}${base_ccy} / Покупка: ${(sale*1).toFixed(2)}${base_ccy}`;

//         this.courseList.append(li);
//         li.append(currency, course);       
//     }


//     courseError(msg) {
//         this.clearCourse();
//         let li = document.createElement("li");
//         li.innerText = `Ошибка: ${msg}`;
//         this.courseList.appendChild(li);
//     }


//     clearCourse() {
//         this.courseList.innerHTML = '';
//     }
// }



// class CoursModel {
//     constructor() {
//         this.courses = [];
//     }


//     setCourses(courses) {
//         this.courses = courses;
//     }


//     clear() {
//         this.courses = [];
//     }
// }



// class CoursControler {
//     constructor(model, view) {
//         this.model = model;
//         this.view = view;
//         this.loadCourse = this.loadCourse;
//     }


//     handle() {
//         this.loadCourse();
//         setInterval(this.loadCourse, 3600000);
//     }


//     loadCourse = () => {
//         this.model.clear();
//         fetch('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
//             .then(res => res.json())
//             .then(result => {
//                 this.model.setCourses(result);
//             })
//             .catch(err => {
//                 console.log(err);
//             })
//             .finally(() => {
//                 this.view.clearCourse();
//                 if(this.model.courses.length === 0) return this.view.courseError('Нет данных');
//                 this.model.courses.forEach(item => this.view.renderCours(item.ccy, item.base_ccy, item.buy, item.sale))
//             });
//     }

// }


// const coursView = new CoursView();
// const coursModel = new CoursModel();
// const coursController = new CoursControler(coursModel, coursView);

// coursController.handle();



class CoursView {
    constructor() {
      this.courseList = document.querySelector('#exchange_rates');
      this.courseWidget = document.querySelector('.course_widget');
    }
  
  
    renderCours(ccy, base_ccy, buy, sale, cb) {
      let li = document.createElement('li');
      let currency = document.createElement('h3');
      let course = document.createElement('p');
  
      if (typeof cb === 'function') cb();
  
      currency.innerText = ccy;
      course.innerText = `Продажа: ${(buy*1).toFixed(2)}${base_ccy} / Покупка: ${(sale*1).toFixed(2)}${base_ccy}`;
  
      li.append(currency, course);
      this.courseList.append(li);
    }
  
  
    courseError(msg) {
      this.clearCourse();
      let li = document.createElement('li');
      li.innerText = `Ошибка: ${msg}`;
      this.courseList.appendChild(li);
    }
  
  
    clearCourse = () => {
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
            let item = result[0];
            this.view.renderCours(item.ccy, item.base_ccy, item.buy, item.sale);
          })
          .catch(err => {
            console.log(err);
          })
          .finally(() => {
            if (!this.model.courses.length) return this.view.courseError('Нет данных');

            this.view.courseWidget.addEventListener('click', ({target: {className}}) => {
              if (!['usd', 'eur', 'rur', 'btc'].includes(className)) return;
              let course = this.model.courses.find(course => course.ccy === className.toUpperCase());
              this.view.renderCours(course.ccy, course.base_ccy, course.buy, course.sale, this.view.clearCourse)
            })
          });
    }
  }
  
  const coursView = new CoursView();
  const coursModel = new CoursModel();
  const coursController = new CoursControler(coursModel, coursView);
  
  coursController.handle();
  