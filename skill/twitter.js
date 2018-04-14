var dateFormat = require('dateformat');
var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

module.exports = {
    /**
     * Skill function. Return an object of the form { 'status': statusCode, 'say': responseText, ... } to the callback.
     * @param {*} entities
     * @param {*} callback
     */
    getTweets: function (entities, callback) {
        // Not implemented
        // if (entity) {
        //     // Prepare Twitter search request
        //     var query = '-filter:retweets -filter:replies "'.concat(entity.value).concat('"');
        //     var params = { count: 1, tweet_mode: 'extended', q: query },
        //         result = '';

        //     // Call API and return results
        //     module.exports.search(function (result) {
        //         callback({ 'say': result });
        //     }, params, result);
        // }
    },

    /**
     * Search tweets synchronous call.
     * @param {*} params 
     * @param {*} result 
     * @param {*} count
     * @access private
     */
    search: function (callback, params, result, count) {
        client.get('search/tweets', params, function (error, tweets, response) {
            if (error) throw error;
            tweets.statuses.forEach(tweet => {
                result += dateFormat(tweet.created_at, 'dddd, mmmm dS') + ': '
                    + formatText(tweet.full_text);
                count ++;
            });
            callback(result, count);
        });
    }
}

/**
 * 
 * @param {*} t 
 * @access private
 */
function formatText(t) {
    return t;
}