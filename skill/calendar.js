var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var dateFormat = require('dateformat');
var moment = require('moment');
var util = require('./util');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

module.exports = {
    /**
     * Skill function. Return an object of the form { 'status': statusCode, 'say': responseText, ... } to the callback. 
     * @param {*} entities
     * @param {*} callback
     */
    calendar: function(entities, callback) {
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        authorize(JSON.parse(process.env.GOOGLE_CALENDAR_API_CLIENT_SECRET_JSON), listEvents, function (results) {
            callback(results);
        });
    }
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @param result
 */
function authorize(credentials, callback, result) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new googleAuth.OAuth2Client(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.setCredentials(JSON.parse(token));
            callback(oauth2Client, result, entities);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {googleAuth.OAuth2Client} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists events on the user's primary calendar.
 *
 * @param {googleAuth.OAuth2Client} auth An authorized OAuth2 client.
 * @param {*} entities
 * @param {*} callback
 */
function listEvents(auth, callback) {
    var text = '';
    var status = 200;
    var req = {
        auth: auth,
        calendarId: 'primary',
        toResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }
    /**
     * Set timeMin and timeMax in search request.
     * Uses Rasa's ner_duckling component. For details on Duckling see https://duckling.wit.ai/#getting-started.
     * Value contained in the entity object is:
     * 1) A date range, from which you get a 'to' and a 'from' date, or
     * 2) A datetime value whose grain can be one of hour|day|week|year
     */
    entities.forEach(function (elem) {
        if (elem.entity && elem.entity == 'time' && elem.extractor == 'ner_duckling') {
            // Found the time entity
            setFromTo(elem, req);
        }
    });
    console.log(req);

    var n = 0;
    var calendar = google.calendar('v3');
    calendar.events.list(req, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            status = 500;
        }
        else {
            var events = response.data.items;
            events.forEach(function (event) {
                if (n > 0)
                    text += ' The ' + ordinal_suffix_of(n + 1);
                if (event.start.dateTime)
                    text += ' starts at ' + dateFormat(event.start.dateTime, 'h:MM TT dddd, mmmm dS.');
                else
                    text += ' is on ' + dateFormat(event.start.date, 'dddd, mmmm dS.');
                text += ' The title is, ' + event.summary + '.';
                n ++;
            });
        }
        if (n == 0)
            eventCount = 'There are no entries on your calendar.'
        else if (n == 1)
            eventCount = 'You have just one calendar entry. It'
        else
            eventCount = 'You have ' + n + ' items on your calendar. The first one'
        text = eventCount + text;
        callback({
            'status': status,
            'say': text
        });
    });
}

function setFromTo(elem, req) {
    var from = null;
    var to = null;
    additionalInfo = elem.additional_info;
    valueObj = additionalInfo.value;

    if (valueObj.from && valueObj.to) {
        from = util.olderOf(from, new Date(valueObj.from));
        to = util.newerOf(to, new Date(valueObj.to));
    }
    else {
        dateObj = new Date(valueObj);

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
        req.timeMin = from.toISOString();
        req.timeMax = to.toISOString();
    }
    else {
        // No datetime element found in the entities JSON
        // Set timeMin = current time
        req.timeMin = new Date().toISOString();
    }
}

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}