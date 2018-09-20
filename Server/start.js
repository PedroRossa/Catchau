var express = require('express');
var app = express();
var { PythonShell } = require('python-shell');
const path = require('path');

PythonShell.defaultOptions = { scriptPath: './src/python/' };

app.listen(3000, function () {
	console.log('server running on port 3000');
});

app.get('/test', test);
//E.g : http://localhost:3000/name?firstname=Mike&lastname=Will 
app.get('/name', callName);
app.get('/voiceRecognition', voiceRecognition);

app.get('/ping', pingFunc);

function pingFunc(req, res){
	console.log(req.query.message);
	res.send("WORKANDO");
}

function test(req, res) {
	let options = {
		mode: 'text',
		pythonOptions: ['-u'], // get print results in real-time
		//args: ['value1', 'value2', 'value3']
	};

	PythonShell.run('test.py', options, function (err, results) {
		if (err) throw err;
		console.log('results: %j', results);
		res.send(results);
	});
}

function callName(req, res){
	let options = {
		mode: 'text',
		pythonOptions: ['-u'], // get print results in real-time
		args: [req.query.firstname, req.query.lastname]
	};

	PythonShell.run('hello.py', options, function (err, results) {
		if (err) throw err;

		console.log('results: %j', results);
		res.send(results);
	});
}

function voiceRecognition(req, res) {

	//train Data
	var trainDataPath = path.join(__dirname,'src/python/DATA/voiceRecData.csv');
	var predictDataPath = path.join(__dirname,'src/python/DATA/voiceRecData.csv');
	//'./DATA/predictionTest_01.csv')
	//'./DATA/fullCarolina.csv')
	//'./DATA/fullPedro.csv')

	let options = {
		mode: 'text',
		pythonOptions: ['-u'], // get print results in real-time
		args: [trainDataPath, predictDataPath]
	};

	PythonShell.run('catchauVoiceRecognition.py', options, function (err, results) {
		if (err) throw err;
		//console.log('results: %j', results);
		res.send(results);
	});
}
