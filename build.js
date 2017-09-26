const {cmd,log} = require('axtool');
var targetFile = 'axva.min.js';
cmd(`babel axva.js -o ${targetFile}`);
cmd(`uglifyjs ${targetFile} -o ${targetFile}`);
log(`build ${targetFile} success!`);