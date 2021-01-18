class ViewWeather {
    constructor() {
        this.inputCity = document.querySelector('.city');
        this.addButtonCity = document.querySelector('.cityBtn');
        this.weatherCity = document.querySelector('#weather');
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

        let dateNow = document.querySelector('.date');
        let month = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
        dateNow.textContent = new Date().getDate() +  ' - ' + month[new Date().getMonth()];

        return item;
    }


    editWeather(cityId, data) {
        let item = this.weatherCity.querySelector('#li' + cityId);
        item.querySelector('p').innerHTML = data;
    }


    removeCity(cityId) {
        this.weatherCity.querySelector('#li' + cityId).remove();
    }


    cityEdit(cityId) {
        let editDiv = document.createElement('div')
        let item = this.weatherCity.querySelector('#li' + cityId);
        let cityName = item.querySelector('h3').innerText;
        item.innerHTML = '';
        let inputEdit = document.createElement('input');
        inputEdit.value = cityName;
        let editBtn = document.createElement('button');
        editBtn.innerHTML = 'Изменить';
        editBtn.setAttribute('data-action', 'save');
        item.appendChild(editDiv);        
        editDiv.append(inputEdit, editBtn);
        editDiv.classList.add('edit_list');
    }

}



class ModelWeather {
    constructor(view) {
        this.view = view;
        this.cities = new Map();
        this.userId = localStorage.getItem('user_id');
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


    deleteCity(id) {
        this.cities.delete(id);
    }


    editCityData(id, newName) {
        let city = this.cities.get(id);
        city.name = newName;
        this.loadWeather(city);
    }


    loadWeather(city) {
        city.weather = 'Загрузка...';
        this.view.editWeather(city.id, city.weather);
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
                                    <img src='https://cdn3.iconfinder.com/data/icons/disaster-and-weather-conditions/48/14-512.png' width='50' alt='Ветер'/> ${result.wind.speed} м/с; 
                                    <img src='http://openweathermap.org/img/w/${result.weather[0].icon}.png' alt='${result.weather[0].description}'/>
                                    <div class='visibility'><span>Видимость: ${result.visibility} м</span></div>
                                    <div class='clouds'><span >Облачность: ${result.clouds.all} %</span></div>`;
                }
                else {
                    city.weather = JSON.stringify(result);
                }
            })
            .catch(err => {
                console.log(err);
                city.weather = 'error';
            })
            .finally(() => {
                this.view.editWeather(city.id, city.weather);
            });
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
                    let handler = this.editAndDeleteCity(el._id, this);
                    item.addEventListener('click', handler);
                    this.model.addCity(el._id, el.name);
                });
            })
            .catch(err => console.log(err));
            this.view.addButtonCity.addEventListener('click', this.showCities);
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
                let handler = this.editAndDeleteCity(result._id, this);
                item.addEventListener('click', handler);
                this.model.addCity(result._id, result.name);
            })
            .catch(err => console.log(err))
            .finally(() => this.view.inputCity.value = '');
    }

    editAndDeleteCity(id, controller) {
        return {
            id: id,
            controller: controller,
            handleEvent(e) {
                let action = e.target.dataset.action;
                switch (action) {

                    case 'remove':
                        fetch(`http://localhost:3000/cities/${this.id}?userid=${this.controller.model.userId}`, {
                            method: 'DELETE'
                        })

                        .then(res => {
                            if (res.status === 200) {
                                this.controller.model.deleteCity(this.id);
                                this.controller.view.removeCity(this.id);
                            }
                        })

                        .catch(err => console.log(err));
                    break;

                    case 'edit':
                        this.controller.view.cityEdit(this.id);
                    break;

                    case 'save':
                        let newName = this.controller.view.weatherCity.querySelector('#li' + this.id + ' input').value;
                        fetch(`http://localhost:3000/cities/${this.id}?userid=${this.controller.model.userId}`, {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({city: newName})
                        })

                        .finally(() => {
                            this.controller.view.renderWeather(this.id, newName);
                        })

                        .then(res => {
                            if (res.status === 200) {
                                this.controller.model.editCityData(this.id, newName);
                            }
                        })
                        .catch(err => console.log(err));
                    break;
                }
            }
        }
    }
}



const viewWeather = new ViewWeather();
const modelWeather = new ModelWeather(viewWeather);
const controllerWeather = new ControllerWeather(viewWeather, modelWeather);



controllerWeather.handle();
