var { date, time, unknown } = require('../skill/basic'),
    train = require('../skill/train').train,
    weather = require('../skill/weather').weather,
    calendar = require('../skill/calendar').calendar;
var dateFormat = require('dateformat');
var moment = require('moment');

module.exports = {
    /**
     * Skill function. Return an object of the form { 'status', statusCode, text': responseText } to the callback. 
     * @param {*} entities
     * @param {*} callback
     */
    myDay: function(entities, callback) {
        var now = new Date();
        var text = '';

        // Set context such as location, date etc.
        if (!entities.location) {
            entities.location = [{
                'value': process.env.DEFAULT_LOCATION,
                'type': 'value'
            }];
        }

        dateValue = dateFormat(now, 'yyyy-mm-dd') + 'T00:00:00.000';
        entities.push({
            'text': 'today',
            'value': dateValue,
            'additional_info': {
                'value': dateValue,
                'grain': 'day'
            },
            'entity': 'time',
            'extractor': 'ner_duckling'
        });

        console.log('entities=', entities);

        weather(entities, function (result) {
            text += result.say;
            calendar(entities, function (result) {
                text += ' ' + result.say;
                train(entities, function (result) {
                    text += ' ' + result.say;
                    text += ' Have a great ' + getGreeting(moment()) 
                        + (process.env.DEFAULT_USER ? ', ' + process.env.DEFAULT_USER : '')
                        + '!';
                    callback({
                        'status': 200,
                        'say': text
                    });
                });
            });
        });
    }
}

/**
 * Get a humanized, 'Morning', 'Afternoon', 'Evening' from moment.js **Great for user greetings!**
 * Courtesy of James1x0 https://gist.github.com/James1x0/8443042
 * Use:
 * The var 'humanizedGreeting' below will equal (assuming the time is 8pm) 'Good evening, James.'
 * var user = 'James';
 * var humanizedGreeting = 'Good ' + getGreetingTime(moment()) + ', ' + user + '.';
 * @param {*} m 
 */
function getGreetingTime (m) {
	var g = null; //return g
	
	if(!m || !m.isValid()) { return; } //if we can't find a valid or filled moment, we return.
	
	var split_afternoon = 12 //24hr time to split the afternoon
	var split_evening = 17 //24hr time to split the evening
	var currentHour = parseFloat(m.format('HH'));
	
	if(currentHour >= split_afternoon && currentHour <= split_evening) {
		g = 'afternoon';
	} else if(currentHour >= split_evening) {
		g = 'evening';
	} else {
		g = 'morning';
	}
	return g;
}

function getGreeting(m) {
	var g = null; //return g
	
    if(!m || !m.isValid()) { return; } //if we can't find a valid or filled moment, we return.
    
	var split_evening = 17 //24hr time to split the evening
	var currentHour = parseFloat(m.format('HH'));
	
	if(currentHour >= split_evening) {
		g = 'evening';
	} else {
		g = 'day';
	}
	return g;
}