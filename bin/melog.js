#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");

var CONFIG_DIR = path.resolve(process.env['HOME'],".melog/conf");
var CONFIG_FILE = path.resolve(CONFIG_DIR, "config.json");
var DATA_DIR = path.resolve(process.env['HOME'],".melog/data");

//crating the CONFIG_DIR
mkdirp.sync(CONFIG_DIR);
//creating the DATA_DIR
mkdirp.sync(DATA_DIR);

var action = process.argv[2];

switch (action) {

	case "use":
		(function() {

			var project = process.argv[3];
			var config = readConfig();
			config['project'] = project;
			saveConfig(config);

			//create the File
			var fd  = fs.openSync(DATA_DIR + "/" + project, "a");
			fs.closeSync(fd);
			console.info("Project Selected to: " + project);
		})();
		break

	case "start":
		(function() {

			var task = process.argv[3];
			var config = readConfig();

			if(config.project) {

				var projectFileName = DATA_DIR + '/' + config.project;
				var tasks = fs.readFileSync(projectFileName, "UTF8");
				if(!tasks || tasks.substr(tasks.length -1, tasks.length) == "\n") {
					//no running task
					var taskInfo = new Date().getTime() + "::" + (task || "-") + "::";
					fs.appendFileSync(projectFileName, taskInfo, "UTF8");

					console.info("Task started!");
				} else {
					console.info("Please stop the running task to create a new task");
				}

			} else {

				console.info("Select a project to create a task");
			}
		})() 
		break;

	case "stop":

		(function() {
			var config = readConfig();

			if(config.project) {

				var projectFileName = DATA_DIR + '/' + config.project;
				var tasks = fs.readFileSync(projectFileName, "UTF8");
				if(!tasks) {
					//just created the project
					console.info("Create your first task now!");
				} else if(tasks.substr(tasks.length -2, tasks.length) != "::") {

					console.info("Please start a task to stop it");

				} else {
					
					var taskInfo = new Date().getTime() + "\n";
					fs.appendFileSync(projectFileName, taskInfo, "UTF8");

					console.info("Task stopped!");
				}

			} else {

				console.info("Select a project to stop a task");
			}
		})();
		break;
}

function readConfig() {

	try{
		var data = fs.readFileSync(CONFIG_FILE, "utf8");
		return JSON.parse(data);
	} catch(ex) {
		return { };
	}
}

function saveConfig (json) {
		
	var data = JSON.stringify(json, null, 4);
	fs.writeFileSync(CONFIG_FILE, data);
}

