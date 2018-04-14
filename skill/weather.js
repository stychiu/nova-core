/**
 * Yahoo Weather API
 * https://developer.yahoo.com/weather/#nodejs
 */
var YQL = require('yql');
var dateFormat = require('dateformat');

module.exports = {
    /**
     * Skill function. Return an object of the form { 'status': statusCode, 'say': responseText, ... } to the callback. 
     * @param {*} entities
     * @param {*} callback
     */
    weather: function(entities, callback) {
        /*
        WOEID:
            Vaughan=23396899, default
            Toronto=4118
        Unit: u=(C)elcius
         */
        var location = process.env.DEFAULT_LOCATION;
        if (entities.location) {
            location = entities.location[0].value
        }
        var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + location + '") and u=\'c\'');
        var resultText = '';
        query.exec(function (err, data) {
            if (data.query.results) {
                var item = data.query.results.channel.item;
                resultText = 'It\'s currently '
                    + item.condition.text
                    + ' and '
                    + item.condition.temp
                    + ' degrees in '
                    + data.query.results.channel.location.city
                    + '. The high will be ' + item.forecast[0].high
                    + ', and the low will be ' + item.forecast[0].low
                    + '.';

                var n = 0;
                resultText += ' Expect ';
                item.forecast.forEach(f => {
                    if (n == 1) {
                        // Hardcoded to 1 day
                        // TODO: Set result based on entities.datetime
                        var d = Date.parse(f.date);
                        resultText += f.text
                            + ' on ' + dateFormat(f.date, 'dddd')
                            + ' with a high of ' + f.high
                            + ' and a low of ' + f.low
                            + '.';
                    }
                    n ++;
                });
                callback({
                    'status': 200,
                    'say': resultText
                });
            }
            else {
                callback({
                    'status': 200,
                    'say': 'I didn\'t find any weather updates for ' + location + '.'
                });
            }
        });
    }
}