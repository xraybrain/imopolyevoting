const inProductionMode = process.env.NODE_ENV === 'production';
let keys = {};

if (inProductionMode) {
  keys = require('./keys/prod');
} else {
  keys = require('./keys/dev');
}

module.exports = keys;
