// Utility functions
/**
 * Generate a random number from 0 to n.
 * @param {*} n 
 */
exports._random = function(n) {
    return Math.round(Math.random() * n);
}

exports.olderOf = function(currMin, newMin) {
    if (!currMin)
        return newMin;

    if (newMin.getDate() < currMin.getDate())
        return newMin;
    else
        return currMin;
}

exports.newerOf = function(currMax, newMax) {
    if (!currMax)
        return newMax;

    if (newMax.getDate() > currMax.getDate())
        return newMax;
    else
        return currMax;
}