const express = require('express');
const { PythonShell } = require('python-shell');
const path = require('path');
const multer = require('multer');

const app = express();

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

PythonShell.defaultOptions = { scriptPath: './src/python/' };

app.listen(3000, function () {
	console.log('server running on port 3000');
});

currentMessage = "";

app.get('/test', test);
//E.g : http://localhost:3000/name?firstname=Mike&lastname=Will 
app.get('/name', callName);
app.post('/voiceRecognition', voiceRecognition);

app.get('/ping', pingFunc);
app.get('/pingClient', pingClientFunc);

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'temp/my_uploads');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
})

let upload = multer({ storage: storage });

app.post('/send', upload.array('csvFiles', 2), voiceRecognition);
app.get('/testBands', testBands);

function pingFunc(req, res) {
	console.log(req.query.message);
	currentMessage = req.query.message;
	res.send(req.query.message);
}

function pingClientFunc(req, res) {
	res.send(currentMessage);
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

function callName(req, res) {
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

//Salvar o retorno e enviar pro cliente

function voiceRecognition(req, res) {
	// got files from client
	let formData = req.body;

	//set paths from train and predict
	var trainDataPath = path.join('temp/my_uploads', req.files[0].originalname);
	var predictDataPath = path.join('temp/my_uploads', req.files[1].originalname);

	//Call python script
	let options = {
		mode: 'text',
		pythonOptions: ['-u'], // get print results in real-time
		args: [trainDataPath, predictDataPath]
	};

	PythonShell.run('catchauVoiceRecognition.py', options, function (err, results) {
		if (err) throw err;
		//console.log('results: %j', results);
		currentMessage = results;
	});
}


function testBands(req, res) {
	let options = {
		mode: 'text',
		pythonOptions: ['-u'], // get print results in real-time
	};

	PythonShell.run('infraredBandsFromRGB.py', options, function (err, results) {
		if (err) throw err;
		//console.log('results: %j', results);
		currentMessage = results;
	});
}
