module.exports = (app) => {
    var fs = require('fs'),
        BackUp = require('./../modules/BackUp'),
        Restore = require("./../modules/Restore");

    const dbConfig = require("./../../config/database.config.js");

    app.post('/backup', function(req, res) {
        var file = req.files.file;

        if (!req.files)
            return res.status(400).send('No files were uploaded.');

        file.mv('upload/restore.zip', function(err) {
            if (err)
                return res.status(500).send(err);

            new Restore(dbConfig.url, 'upload/restore.zip', true).restore();
        })
    });

    app.get('/backup', function(req, res) {
        new BackUp(dbConfig.url, "./upload").backup(function (data) {
            res.download('./upload/backup.zip', 'Backup-database.zip', function (err) {
                if (err) {
                    //handle error
                    return;
                } else {
                    //do something
                    res.status(200);
                    res.end();
                }
            })
        });
    });
};