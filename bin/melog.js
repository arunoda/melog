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

			var description = process.argv[3];
			var config = readConfig();

			if(config.project) {

				var projectFileName = DATA_DIR + '/' + config.project;
				var tasks = fs.readFileSync(projectFileName, "UTF8");

				if(!tasks) {
					//no any task, just add
					writeTaskInfo();
				} else {

					var jsonTasks = tasks.split("\n");
					var lastLine = jsonTasks[jsonTasks.length -1];
					var task = JSON.parse(lastLine);

					if(task.stopAt) {
						//if this task stopped, crate the our task
						writeTaskInfo();
					} else {
						//error message
						console.info("Please stop the running task to create a new task");
					}
				}

				function writeTaskInfo() {
					var taskInfo = {
						startAt: new Date().getTime(),
						description: description
					};
					fs.appendFileSync(projectFileName, "\n" + JSON.stringify(taskInfo), "UTF8");
				};

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
					//no any task, just add
					console.info("Create your first task now!");
				} else {

					var jsonTasks = tasks.split("\n");
					var lastLine = jsonTasks[jsonTasks.length -1];
					var task = JSON.parse(lastLine);

					if(task.stopAt) {
						//if this task stopped, show some error
						console.info("Please start a task to stop it");
					} else {
						//stop the task
						task.stopAt = new Date().getTime();
						fs.appendFileSync(projectFileName, "\n" + JSON.stringify(task) , "UTF8");
						console.info("Task stopped!");
					}
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

