var fs = require('fs');
var dateFormat = require('dateformat');
var _random = require('./util')._random;

module.exports = {
    /**
     * Get date. Return an object of the form { 'status': statusCode, 'say': responseText, ... } to the callback. 
     * @param {*} entities
     * @param {*} callback
     */
    date: function(entities, callback) {
        var responses = [
            dateFormat(new Date(), 'dddd, mmmm dS, yyyy.'),
                'It is ' + dateFormat(new Date(), 'dddd, mmmm dS, yyyy.'),
                'Today is ' + dateFormat(new Date(), 'dddd, mmmm dS, yyyy.')
        ];
        callback({
            'status': 200,
            'say': responses[_random(responses.length - 1)]
        });
    },

    /**
     * Get time. Return an object of the form { 'status': statusCode, 'say': responseText, ... } to the callback. 
     * @param {*} entities
     * @param {*} callback
     */
    time: function(entities, callback) {
        var responses = [
            dateFormat(new Date(), 'h:MM TT.'),
                "The time is " + dateFormat(new Date(), 'h:MM TT.'),
                'It is currently ' + dateFormat(new Date(), 'h:MM TT.')
        ];
        callback({
            'status': 200,
            'say': responses[_random(responses.length - 1)]
        });
     },

    /**
     * A function for handling unknown intents. Return an object of the form { 'status': statusCode, 'say': responseText, ... } to the callback. 
     * @param {*} entities
     * @param {*} callback
     */
    unknown: function(entities, callback) {
        var responses = [
            'Sorry, I\'m not sure how to help.',
            'Sorry, I don\'t know how to do that yet.'
        ];
        callback({
            'status': 404,
            'say': responses[_random(responses.length - 1)]
        });
    }
}