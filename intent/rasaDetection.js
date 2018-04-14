var request = require('request');
var { date, time, unknown, media } = require('../skill/basic'),
    train = require('../skill/train').train
    weather = require('../skill/weather').weather
    calendar = require('../skill/calendar').calendar,
    myDay = require('../skill/myday').myDay,
    news = require('../skill/news').news,
    music = require('../skill/music').music,
    websearch = require('../skill/websearch').websearch;

/** 
 * Rasa Natural Lanaguage Processing
 * https://nlu.rasa.com/index.html
 * https://github.com/RasaHQ/rasa_nlu

/**
 * Detect user intent using Rasa NLP.
 * @param {*} text
 * @param {*} callback
 * @return intent and entities to callback.
 */
exports.run = function(text, callback) {
    // First try and match keywords locally
    if (text.indexOf('play') > -1) {
        value = text.replace(/.*play /, '');
        callback(music, { 'value': value });
    }
    else if (text.indexOf('search the web for ') > -1) {
        value = text.substr(19, text.length);
        callback(websearch, { 'value': value });
    }
    else {
        // Send query to Rasa server
        request({
            'url': process.env.RASA_SERVER_URL,
            'qs': { q: text }
        }, (error, response, body) => {
            data = JSON.parse(body);
            if (data.intent) {
                switch (data.intent.name) {
                    case 'date':
                        intent = date;
                        break;
                    case 'time':
                        intent = time;
                        break;
                    case 'train':
                        intent = train;
                        break;
                    case 'weather':
                        intent = weather;
                        break;
                    case 'calendar':
                        intent = calendar;
                        break;
                    case 'myday':
                        intent = myDay;
                        break;
                    case 'news':
                        intent = news;
                        break;
                    default:
                        intent = unknown;
                }
            }
            else {
                intent = unknown;
            }
            entities = data.entities;
            callback(intent, entities);
        })
    }
}