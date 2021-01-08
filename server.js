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

//ADD cities

app.get('/cities', (req, res) => {
    db.collection('cities').find({user_id: req.query.userid}).toArray((err, docs) => {
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.stsuts(200).json(docs);
    });
});

app.post('/cities', (req, res) => {
    let city = {
        name: req.body.city,
        user_id: req.body.user_id
    }
    db.collection('cities').insertOne(city, (err, result) => {
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.stsuts(200).json(city);
    });
});

// Delete city

app.delete('/cities/:id', (req, res) => {
    db.collection('cities').deleteOne({_id: ObjectID(req.params.id), user_id: req.query.userid}, (err, result) => {
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.stsuts(200);
    })
})

//Edit city 

app.put('/cities/:id', (req, res) => {
    db.collection('cities').updateOne({_id: ObjectID(req.params.id), user_id: req.query.userid}, {$set: {name: req.body.city}}, (err, result) => {
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.stsuts(200);
    });
});


client.connect (function(err) {
    if(err) return console.log(err);
    db = client.db(dbName);
    app.listen(3000, () => console.log('API started'));
})

