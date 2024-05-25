const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = process.env.DB_CONNECTION_STRING;
db.slackbot = require("./slackbot.model.js")(mongoose);

module.exports = db;