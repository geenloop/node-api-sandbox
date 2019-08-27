// DEPENDICIES
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressOasGenerator = require("express-oas-generator");

// CONFIG
const dbConfig = require("./config/database.config.js");

// SET A WEB SERVER
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES
require("./app/routes/note.routes.js")(app);
// define a default ROUTE to redirect to API-DOC
app.get("/", (req, res) => {
    res.redirect('/api-docs');
});

// SWAGGER API DOC
// DOC is generated automatic by Express routes, BUT....
// but it is NOT exporting parameters in PUT/POST, like name/email/pass and do on...
// list routes, NOT parameters but if you know me, you know that ME = NO doc/comments
// $$$ BIG BOUNTY for who will find automatized solution !!!

//let data = JSON.stringify(spec)
//fs.writeFileSync('data.json', data);
expressOasGenerator.init(app, {});

// CONNECT TO DATABASE
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
	useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
});

// START SERVER
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});