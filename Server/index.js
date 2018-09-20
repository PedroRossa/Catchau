const express = require('express');
const { PythonShell } = require('python-shell');
require('child_process').spawn('cmd', ['/c', 'dir']);

const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


// https://medium.com/@HolmesLaurence/integrating-node-and-python-6b8454bfc272


var runPythonRoutine = function (request, response) {
    var PythonShell = require('python-shell');
    var options = {
        mode: 'text',
        pythonPath: 'python',
        pythonOptions: [],
        scriptPath: '.',
        args: ['-s']
    };

    // PythonShell.run('test.py', options, function (err, results) {
    //     console.log(err);
    // });

    PythonShell.runString('x=1+1;print(x)', options, function (err) {
        if (err) throw err;
        console.log('finished');
    });
}

app.get('/test', runPythonRoutine);
