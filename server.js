// ef0286704f24b578161caf6eeba4fcfb

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;


let app = express();
let db;

const url = 'mongodb://localhost:27017';
const dbName = 'weather_WEB_APP';
const client = new MongoClient(url);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));


app.get('/', (req, res) => res.sendFile('public/index.html'), 
    (err) => console.log(err));

app.post('/', (req, res) => {
    let user = {
        name: 'user'
    }
    db.collection('users').insertOne(user, (err, result) => {
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.status(200).json(user);
    });
});


client.connect (function(err) {
    if(err) return console.log(err);
    db = client.db(dbName);
    app.listen(3000, () => console.log('API started'));
})

