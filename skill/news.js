var http = require('http');
var xml2js = require('xml2js')

module.exports = {
    /**
     * Play news from CBC. Return an object of the form { 'status': statusCode, 'say': responseText, ... } to the callback. 
     * @param {*} entities
     * @param {*} callback
     */
    news: function (entities, callback) {
        var url = 'http://www.cbc.ca/podcasting/includes/hourlynews.xml';
        xmlToJson(url, function (err, data) {
            if (err) {
                callback({
                    'status': 500,
                    'say': ''
                });
            }
            else {
                callback({
                    'status': 200,
                    'say': data.rss.channel[0].item[0].description[0],
                    'play': data.rss.channel[0].item[0].enclosure[0].$.url
                });
            }
        });
    }
}

function xmlToJson(url, callback) {
    var req = http.get(url, function (res) {
        var xml = '';

        res.on('data', function (chunk) {
            xml += chunk;
        });

        res.on('error', function (e) {
            callback(e, null);
        });

        res.on('timeout', function (e) {
            callback(e, null);
        });

        res.on('end', function () {
            xml2js.parseString(xml, function (err, result) {
                callback(null, result);
            });
        });
    });
}