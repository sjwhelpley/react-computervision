const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
require('dotenv').config()

const db = {};
db.mongoose = mongoose;
db.url = process.env.MONGODB_URL;
db.task = require("./task.model.js")(mongoose);
db.subtask = require("./subtask.model.js")(mongoose);

module.exports = db;