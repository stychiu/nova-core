require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var intentDetection = require('./intent/rasaDetection');

var app = express();
var port = process.env.PORT || 3001;

app.use(bodyParser.json());

app.post('/api/v1', function(req, res) {
    console.log('POST /api/v1');
    console.log('Request:', req.body);

    if (req.body.text) {
        var text = req.body.text.toLowerCase();
        
        intentDetection.run(text, function(intent, entities) {

            // Intent detected, now invoke the skill function.
            intent.call(null, entities, function(result) {
                result.intent = intent;
                result.entities = JSON.stringify(entities);
                console.log('Response:', result);
                res.json(result);
            })
        });
    }
    else {
        res.status(500);
    }
});

var server = app.listen(port, function () {
    console.log('Listening on port ' + port);
});