/**
 * Wikipedia API
 */
const wiki = require('wikijs').default;
 
module.exports = {
    /**
     * Skill function. Return an object of the form { 'status': statusCode, 'say': responseText, ... } to the callback. 
     * @param {*} entities
     * @param {*} callback
     */
    getWiki: function (entities, callback) {
        // Not implemented        
        // if (entity) {
        //     wiki().page(entity.value)
        //         .then(page => page.summary())
        //         .then(function(page) {
        //             callback({ 'say': page });
        //         });
        // }
    }
};