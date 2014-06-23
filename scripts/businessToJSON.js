
if(!process.argv[2] || !process.argv[3]) {
    throw "usage: node businessToJSON.js <input.csv> <output.json>";
}

var _ = require('lodash');
var fs = require('fs');
var csv = require('node-csv').createParser();

csv.parseFile(process.argv[2], function(err, data) {

    var out = {};
    _.forEach(data, function(line) {
        out[line[0]] = line[1];
    });

    console.log(JSON.stringify(out, null, 4));

    fs.writeFile(process.argv[3], JSON.stringify(out, null, 4), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + process.argv[3]);
        }
    });
});