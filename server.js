'use-strict';

require('dotenv').config();
const express = require('express');
const formidable = require('formidable');
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors');
var port = process.env.PORT || 8000;

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/exercise-track', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Schema = mongoose.Schema;

app.use(express.static(__dirname));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/fileanalyse', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, _fields, { file }) => {
        if (err) {
            res.err(err.message);
        }

        res.json({ "name": file.name, "type": file.type, "size": file.size });
    });
});

// Not found middleware
app.use((req, res, next) => {
    return next({ status: 404, message: 'not found' })
});

// Error Handling middleware
app.use((err, req, res, next) => {
    let errCode, errMessage;

    if (err.errors) {
        // mongoose validation error
        errCode = 400 // bad request
        const keys = Object.keys(err.errors);
        // report the first validation error
        errMessage = err.errors[keys[0]].message;
    } else {
        // generic or custom error
        errCode = err.status || 500;
        errMessage = err.message || 'Internal Server Error';
    }
    res.status(errCode).type('txt').send(errMessage);
});

app.listen(port, function () {
    console.log(`Listening to requests on http://localhost:${port}`);
});