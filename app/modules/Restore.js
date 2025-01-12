
/**

Author: Seun Matt (smatt382@gmail.com);

Project Name: restore-backup-mongodb

Project Desc:

This module will restore backup of mongodb created by backup-mongodb
in .zip format.

@param(databaseUri) the uri to the mongodatabase e.g. mongodb://127.0.0.1:27017/test

@param (pathToZipFile) path/to/backupfile.zip

Usage:

var databaseUri = "mongodb://127.0.0.1:27017/test";

var filePath = "backup/dev_19_9_16.21.40.28.zip";

var Restore = require("restore-backup-mongodb");

new Restore(databaseUri, filePath).restore();


*
**/


var fs = require("fs-extra");
var path = require("path");
var unzip = require("unzipper");

var mongodb = require("mongodb");
var mongoClient = require("mongodb").MongoClient;

var databaseUri;
var fileNames = [];
var jsonData = []; //this file will contain the loaded data
var db; //global db object
var zipPath; // path/to/zipfile.zip
var tempPath = "upload/tmp";

var d; //global var for done callback for mocha test

var winston = require("winston");
var ObjectID = require("mongodb").ObjectID;

//this boolean value will determine if the database utilizes the ObjectID class of mongodb
var isObjectID = true;

function Restore(dbaseUri, pathToZipFile, useObjectID) {

  if(!dbaseUri || !pathToZipFile) { 
  	winston.error("incomplete params \ndbaseUri = " + dbaseUri + "\npathToZipFile = " + pathToZipFile); 
  	throw new Error("incomplete params \ndbaseUri = " + dbaseUri + "\npathToZipFile = " + pathToZipFile);
  	if(d) d();
  	}

  	if(useObjectID) {
  		isObjectID = useObjectID;
  	}

	databaseUri = dbaseUri;
	zipPath = pathToZipFile;

}


Restore.prototype.restore = function(done) {

	 d = done;

	mongoClient.connect(databaseUri, function(error, dbObj) {

		if(error) { 
			winston.error("ERROR CONNECTING TO MONGODB " + error);
			if(d) d();
			return;
		}
		else {

			winston.info("Restore Script Connected to MongoDb successfully");
			db = dbObj;
			
			// first extract the zip file to tempPath
			 extractZip();
		}

	});
 }


function extractZip() {
 	// this is the first thing to be done. It extracts the zip file
 	var unzipExtractor = unzip.Extract({ path: tempPath});
	unzipExtractor.on("close", function() { 
	winston.info("Extraction Complete . . .");

	// now invoke getAllCollections to read the dir for the .json files
	getAllCollections();

	});

	fs.createReadStream(zipPath).pipe(unzipExtractor);

}



function getAllCollections() {

 // the zip has been extracted to tempPath
 // this will walk through the dir and read all the files in the tempPath
 // it will then save the names of each file in the fileNames[]
 // The files are collections from the database in .json format

	fs.readdir(tempPath, function(error, results) {
		if(error) { 
			winston.error("error reading dir from restore " + error); 
			db.close();
			if(d) d(); 
			return;
		}
		else { 
			winston.info("dir read and contains " + results.length + " files");
			
			for(var x in results) {

				if(results[x].indexOf(".zip") < 0) { // remove the .zip archive
					fileNames.push(path.win32.basename(results[x], ".json"));
			    }

				if(x == results.length - 1) { 
					winston.info("fileNames = " + fileNames);
					loadJsonData(0);
				}
			}

			
		}
	});
}




function loadJsonData(z) {
    
	//this will load the data in the json files i.e the collections 
	//it will load the data for a single file per time and save the data to the db
	// after completing a file, it will progress to another file

	if(z > fileNames.length - 1) { 
		winston.info("Restoration procedure complete..."); 
		//db.close();
		fs.remove(tempPath, function(error){
			if(error) {
				winston.error("error removing temporary path " + error);
				if(d) d();
			}
			else {
				winston.verbose("tempPath removed");
				if(d) d();
				 }
		});
	}

	else {

		winston.debug("\nload json data invoked " + z);

		var collectionName = fileNames[z];

		winston.info("collection under processing = " + collectionName + "\n");

		fs.readJson(tempPath + "/" + collectionName + ".json", function(error, fileData) {
			if(error) { 
					winston.error("error reading file in Restore " + fileNames[z] + ": " + error); 
					db.close(); 
					if(d) d(); 
					return; }
			else {
				// function callback () { loadJsonData(z + 1); }
				saveToDb( fileData, 0, collectionName, function() { loadJsonData(z + 1) });
	          }
	    }); //end fs
	}
}




function saveToDb(fileData, x, collectionName, callback) {

	//this method will accept fileData which are the actual records in the collection file
	//it will save each record contained in the data to the database
	//if the record exits it will update it else it will just create it
	//once it's done it will call loadJsonData to load another file for processing

 if(x > fileData.length - 1) { winston.info("Done Processing " + collectionName + "\n"); callback(); }
  
  else {

	winston.verbose("fileData length = " + fileData.length);
	var collection = fileData[x];
	
	// add this data to the database

	//change the ID to ObjectID
	//if the isObjectID variable is true
	if(isObjectID) {	
		collection._id = new ObjectID.createFromHexString(collection._id);
	 }


	db.collection(collectionName).update({"_id":collection._id}, collection, {upsert: true}, function(error, result){

    if(error) { 
    	winston.error("error updating document " + collectionName + " : " + error);
    	if(d) d(); 

    }  else { 
		
		winston.verbose("update successful " + result); 
		saveToDb(fileData, (x + 1), collectionName, callback);
	    
	    }
	
	});

  }

}



module.exports = Restore;