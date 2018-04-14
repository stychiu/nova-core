// Microsoft Bing Web Search API
// https://github.com/Azure-Samples/cognitive-services-node-sdk-samples/blob/master/Samples/webSearch.js

'use strict';

const os = require("os");
const async = require('async');
const Search = require('azure-cognitiveservices-search');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

let serviceKey = process.env.MICROSOFT_WEB_SEARCH_API_KEY;

let credentials = new CognitiveServicesCredentials(serviceKey);
let webSearchApiClient = new Search.WebSearchAPIClient(credentials);
let webModels = webSearchApiClient.models;

module.exports = {
    /**
     * Perform a web search and return the first webpage result found.
     * Return an object of the form { 'status': statusCode, 'say': responseText, ... } to the callback. 
     * @param {*} entities
     * @param {*} callback
     */
    websearch: function (entities, callback) {
        async.series([
            async function () {
                let result;
                try {
                    result = await webSearchApiClient.web.search(entities.value, {
                        mkt: 'en-CA',
                        count: 1
                    })
                } catch (err) {
                    if (err instanceof webModels.ErrorResponse) {
                        console.log("Encountered exception. " + err.message);
                    } else {
                        throw err;
                    }
                }

                // WebPages
                try {
                    if (result.webPages.value.length > 0) {
                        result.webPages.value.forEach(function (webpage) {
                            let shortUrl = webpage.url.replace(/^http.*\/\//, '').replace(/\/.*$/, '');
                            let text = shortUrl;
                            text += ': ';
                            text += webpage.snippet;
                            callback({
                                'status': 200,
                                'say': text,
                                'url': webpage.url
                            });
                        });
                    }
                    else {
                        throw new TypeError();
                    }
                } catch (err) {
                    if (err instanceof TypeError) {
                        console.log("Didn't see any Web data..");
                    } else {
                        throw err;
                    }
                }
            }
        ], (err) => {
            throw (err);
        });
    }
};