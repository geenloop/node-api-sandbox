// DEPENDICIES
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// CONFIG
const dbConfig = require('./config/database.config.js');

// SET A WEB SERVER
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// ROUTES
require('./app/routes/note.routes.js')(app);
// define a default ROUTE
app.get('/', (req, res) => {
    res.json({"message": "Welcome to EasyNotes application. Take notes quickly. Organize and keep track of all your notes."});
});

// CONNECT TO DATABASE
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
	useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// START SERVER
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});