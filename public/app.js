class ViewWeather {
    constructor() {
        this.inputCity = document.querySelector('.city');
        this.addButtonCity = document.querySelector('.cityBtn');
        this.weatherCity = document.querySelector('#weather');
        this.userWeather = document.querySelector('#user_weather');
    }

    renderWeather(cityId, cityName) {
        let item = this.weatherCity.querySelector('#li' + cityId);
        let div = document.createElement('div');
        let cityTitle = document.createElement('h3');
        let weatherData = document.createElement('p');
        let editCityBtn = document.createElement('button');
        let deleteBtn = document.createElement('button');

        if (item == null) {
            item = document.createElement('li');
            item.setAttribute('id', 'li' + cityId);
            this.weatherCity.appendChild(item);
        }

        cityTitle.innerHTML = cityName;
        deleteBtn.innerHTML = 'Удалить';
        editCityBtn.innerHTML = 'Изменить';
        item.innerHTML = '';

        editCityBtn.setAttribute('data-action', 'edit');
        deleteBtn.setAttribute('data-action', 'remove');

        item.append(div, editCityBtn, deleteBtn);
        div.append(cityTitle, weatherData);

        let dataNow = document.querySelector('.data');
        let month = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
        dataNow.textContent = new Date().getDate() + ', ' + month[new Date().getMonth()];

        return item;
    }


    

}



class ModelWeather {
    constructor(view) {
        this.view = view;
        
        this.cities = new Map();
        this.currentCity = {
            location: null,
            name: 'Неизвестно',
            weather: 'Неизвестно'
        }
    }


    addCity(id, name) {
        let city = {
            id: id,
            name: name,
            weather: ''
        }
        this.cities.set(id, city);
        this.loadWeather(city);
    }


    

    loadWeather(city) {
        city.weather = 'Загрузка...';
       

        let url = new URL('http://api.openweathermap.org/data/2.5/weather');
        url.searchParams.set('appid', 'ef0286704f24b578161caf6eeba4fcfb');
        url.searchParams.set('q', city.name);
        url.searchParams.set('lang', 'ru');
        url.searchParams.set('units', 'metric');

        fetch(url)
            .then(res => res.json())
            .then(result => {
                if (result.cod == 200) {
                    city.weather = `<img src='https://cdn.iconscout.com/icon/free/png-256/celsius-1403881-1187974.png' width='50' alt='Температура'/> ${(result.main.temp).toFixed(0)}&deg; C; 
                                    <img src='https://cdn3.iconfinder.com/data/icons/disaster-and-weather-conditions/48/14-512.png' width='50' alt='Ветер'/> ${result.wind.speed} км/ч; 
                                    <img src='http://openweathermap.org/img/w/${result.weather[0].icon}.png' alt='${result.weather[0].description}'/>`;
                }

                else {
                    city.weather = JSON.stringify(result);
                }
            })
            .catch(err => {
                console.log(err);
                city.weather = 'error';
            })
            
    }

}

class ControllerWeather {
    constructor (view, model) {
        this.model = model;
        this.view = view;    
        this.handle = this.handle;
        this.showCities = this.showCities;
    }

    handle = () => {
       

        fetch(`http://localhost:3000/cities?userid=${this.model.userId}`)
            .then(res => res.json())
            .then(result => {
                result.forEach(el => {
                    let item = this.view.renderWeather(el._id, el.name);
                   
                    this.model.addCity(el._id, el.name);
                });
            })
            .catch(err => console.log(err));
            this.view.addButtonCity.addEventListener("click", this.showCities);
    }


    showCities = () => {
        let cityName = this.view.inputCity.value;
        if (cityName.length === 0) return;

        fetch('http://localhost:3000/cities', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                city: cityName,
                user_id: this.model.userId
            })
        })
            .then(res => res.json())
            .then(result => {
                let item = this.view.renderWeather(result._id, result.name);
               
                this.model.addCity(result._id, result.name);
            })

            .catch(err => console.log(err))
            .finally(() => this.view.inputCity.value = '');
    }

    
}



const viewWeather = new ViewWeather();
const modelWeather = new ModelWeather(viewWeather);
const controllerWeather = new ControllerWeather(viewWeather, modelWeather);



controllerWeather.handle();
