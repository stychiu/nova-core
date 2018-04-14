var glob = require('glob');

module.exports = {
    /**
     * Plays media files.
     */
    music: function(entities, callback) {
        var pattern = process.env.MEDIA_LOCATION + '/*' + entities.value.replace(/\s/g, '') + '*.+(wav|mp3)';
        var options = null;

        console.log('glob pattern:' + pattern);

        glob(pattern, options, function (er, files) {
            // files is an array of filenames.
            // If the `nonull` option is set, and nothing
            // was found, then files is ["**/*.js"]
            // er is an error object or null.

            console.log('glob found: ' + files);

            if (files.length < 1) {
                callback({
                    'status': 200,
                    'say': 'I couldn\'t find anything that matches ' + entities.value
                });
            }
            else if (files.length == 1) {
                callback({
                    'status': 200,
                    'say': 'Playing ' + entities.value,
                    'play': files[0]
                });
            }
            else {
                callback({
                    'status': 200,
                    'say': 'I found more than one file with that name. Try something more specific.'
                });
            }
        });
    }
}