var moment = require('moment');
var _twitter = require('./twitter');
var util = require('./util');

module.exports = {
    /**
     * Skill function. Return an object of the form { 'status': statusCode, 'say': responseText, ... } to the callback. 
     * @param {*} entities
     * @param {*} callback
     */
    train: function(entities, callback) {
        var params = { count: 1, tweet_mode: 'extended', q: 'from:GOtransitBR -filter:retweets -filter:replies' };
        /**
         * Set 'since:' and 'until:' in search query.
         * Uses Rasa's ner_duckling component. For details on Duckling see https://duckling.wit.ai/#getting-started.
         * Value contained in the entity object is:
         * 1) A date range, from which you get a 'to' and a 'from' date, or
         * 2) A datetime value whose grain can be one of hour|day|week|year
         */
        entities.forEach(function (elem) {
            if (elem.entity && elem.entity == 'time' && elem.extractor == 'ner_duckling') {
                // Found the time entity
                setFromTo(elem, params);
            }
        });
        console.log(params);

        var result = '';
        var count = 0;
        _twitter.search(function(result, count) {
            if (count == 0) {
                callback({
                    'status': 200,
                    'say': 'Nothing from Go Transit.'
                });
            }
            else {
                callback({
                    'status': 200,
                    'say': 'Here are the latest tweets from Go Transit: ' + abbreviate(result)
                });
            }
        }, params, result, count);
    }
}

function abbreviate(result) {
    return result
        .replace(/Union.*([0-9][0-9]:[0-9][0-9]) - (Allandale Waterfront|Bradford|Aurora).*[0-9][0-9]:[0-9][0-9]/, 'northbound train leaving Union at $1')
        .replace(/(Allandale Waterfront|Bradford|Aurora).* - Union.*([0-9][0-9]:[0-9][0-9])/, 'southbound train arriving at Union at $2')
        .replace(/#GO *train */g, '');
}

function setFromTo(elem, params) {
    var from = null;
    var to = null;
    additionalInfo = elem.additional_info;
    valueObj = additionalInfo.value;

    if (valueObj.from && valueObj.to) {
        from = util.olderOf(from, new Date(valueObj.from));
        to = util.newerOf(to, new Date(valueObj.to));
    }
    else {
        var dateObj = new Date(valueObj);
        switch (additionalInfo.grain) {
            case 'hour':
                from = util.olderOf(from, dateObj);
                to = util.newerOf(to, moment(dateObj).endOf('day').toDate());
                break;
            case 'day':
                from = util.olderOf(from, dateObj);
                to = util.newerOf(to, moment(dateObj).endOf('day').toDate());
                break;
            case 'week':
                from = util.olderOf(from, dateObj);
                to = util.newerOf(to, moment(dateObj).endOf('week').toDate());
                break;
                break;
            case 'month':
                from = util.olderOf(from, dateObj);
                to = util.newerOf(to, moment(dateObj).endOf('month').toDate());
                break;
            case 'year':
                from = util.olderOf(from, dateObj);
                to = util.newerOf(to, moment(dateObj).endOf('year').toDate());
            default:
        }
    }
    if (from && to) {
        params.q += ' since:' + from.toISOString();
        params.q += ' until:' + to.toISOString();
    }
    else {
        // No datetime element found in the entities JSON
        // Set timeMin = current time
        params.q += ' since:' + new Date().toISOString();
    }
}