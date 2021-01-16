class UserView {
    constructor() {
        this.userWeather = document.querySelector('#user_weather');
    }

    userCurrentWeather(cityName, data) {
        const item = this.userWeather.querySelector('#current_weather');
        item.querySelector('h3').innerHTML = cityName;
        item.querySelector('div').innerHTML = data;
    }
}



class UserModel {
    constructor(view) {
        this.view = view;
        this.userId = localStorage.getItem('user_id');
        this.currentCity = {
            location: null,
            name: 'Неизвестно',
            weather: 'Неизвестно'
        }
    }

    saveUser(userId) {
        this.userId = userId;
        localStorage.setItem("user_id", userId);
    }

    location(loc) {
        this.currentCity.loc = loc;
        if (loc == null) {
            this.currentCity.name = 'Неизвестно';
            this.currentCity.weather = 'Не удалось определить ваше местоположение';
            this.view.userCurrentWeather(this.currentCity.name, this.currentCity.weather);
            return;
        }
        this.loadCurrentWeather();
    }


    loadCurrentWeather() {
        let url = new URL('http://api.openweathermap.org/data/2.5/weather');
        url.searchParams.set('appid', 'ef0286704f24b578161caf6eeba4fcfb');
        url.searchParams.set('lat', this.currentCity.loc[0]);
        url.searchParams.set('lon', this.currentCity.loc[1]);
        url.searchParams.set('lang', 'ru');
        url.searchParams.set('units', 'metric');

        fetch(url)
            .then(res => res.json())
            .then(result => {
                if (result.cod === 200) {
                    this.currentCity.name = result.name;
                    this.currentCity.weather = `<div><img src='https://cdn.iconscout.com/icon/free/png-256/celsius-1403881-1187974.png' width='50' alt='Температура'/> <span>${(result.main.temp).toFixed(0)}&deg; C;</span></div> 
                                                <div><img src='https://cdn3.iconfinder.com/data/icons/disaster-and-weather-conditions/48/14-512.png' width='50' alt='Ветер'/> <span>${result.wind.speed} м/с;</span></div> 
                                                <img src='http://openweathermap.org/img/w/${result.weather[0].icon}.png' width='60' alt='${result.weather[0].description}'/>`;
                } else {
                    this.currentCity.name = `error cod=${result.cod}`;
                    this.currentCity.weather = JSON.stringify(result);
                }
            })

            .catch(err => {
                console.log(err);
                this.currentCity.name = `Неизвестно`;
                this.currentCity.weather = 'error';
            })
            .finally(() => {
                this.view.userCurrentWeather(this.currentCity.name, this.currentCity.weather);
            });
    }
}


class UserController {
    constructor (view, model) {
        this.model = model;
        this.view = view;    
        this.handle = this.handle;
    }

    handle = () => {
        if (this.model.userId === null) {
            fetch('http://localhost:3000/cities', {
                method: 'POST'
            })
                .then(res => res.json())
                .then(result => {
                    this.model.saveUser(result._id);
                })
                .catch(err => console.log(err));
        }
        else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => this.model.location([pos.coords.latitude, pos.coords.longitude]),
                (err) => this.model.location(null)
            );

        } else {
            this.model.location(null);
        } 
    }

    
}



const userView = new UserView();
const userModel = new UserModel(userView);
const userController = new UserController(userView, userModel);



userController.handle();