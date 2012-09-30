#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var printf = require("printf");
require('colors');

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
						console.info("Task started!");
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

	case "status":

		(function() {


			var project = process.argv[3];
			var projectFileName = DATA_DIR + '/' + project;
			
			var tasks = fs.readFileSync(projectFileName, "UTF8");

			console.info(printf("\n PROJECT STATUS: %s ", project).inverse.bold);

			if(!tasks) {
				//no any task, just add
				console.info("Project does not have any tasks");
			} else {

				var jsonTasks = tasks.split("\n");
				var previousTask = null;
				var startTask = null;
				var totalTime = 0; //in minitues
				
				console.log("\nFinished Tasks".green.bold);

				jsonTasks.forEach(function(task) {

					if(task) {
						if(startTask) {

							var endTask = JSON.parse(task);
							printTask(startTask, endTask.stopAt);
							previousTask = startTask;
							startTask = null;
						} else {

							startTask = JSON.parse(task);
						}
					}
				});

				if(startTask) {
					//print not finished task
					console.log("\nNot Finished Tasks".green.bold);
					printTask(startTask, new Date().getTime());
				}

				//display totalTime
				console.log(printf("\nTOTAL TIME: %.2f min\n", totalTime).cyan.bold);

				function printTask(startTask, stopAt) {

					//if there is no description get it from the previous menu
					if(!startTask.description && previousTask) {
						startTask.description = previousTask.description;
					}

					var timeDiff = calcTimeDiff(startTask.startAt, stopAt);
					totalTime += timeDiff.min;
					var str = printf("%s [%.2f min] [%.2f min]", startTask.description, timeDiff.min, totalTime);
					console.info(str);
				}

				function calcTimeDiff(start, end) {

					var min = (end - start) / (1000 * 60);
					return {
						min: min
					};
				}
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

