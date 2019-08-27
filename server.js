// DEPENDICIES
const fs = require('fs');
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressOasGenerator = require("express-oas-generator");
const fileUpload = require('express-fileupload');
//const multer = require('multer');

// CONFIG
const dbConfig = require("./config/database.config.js");

// SET A WEB SERVER
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//SET MULTER
//app.use(multer());

// SET FILE UPLOADER
app.use(fileUpload());

// ROUTES
require("./app/routes/note.routes.js")(app);
require("./app/routes/backup.routes.js")(app);
// define a default ROUTE to redirect to API-DOC
app.get("/", (req, res) => {
    fs.readFile('package.json', 'utf8', function (err, data) {
        if (err) throw err;
        var configData = JSON.parse(data);
        res.render(
            'index',
            {
                appName: configData.name,
                appVersion: configData.name + " v" + configData.version,
            });
    });
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
    console.log("Database connected");
}).catch(err => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
});

// SET PUG template rendering
app.set('view engine', 'pug');

// SET public and upload folder for backup/restore
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, 'upload')));

// START SERVER
app.listen(3000, () => {
    console.log("Server running");
});