const express = require('express')
const app = express()
const port = 3000

var PythonShell = require('python-shell');

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


// https://medium.com/@HolmesLaurence/integrating-node-and-python-6b8454bfc272

app.get('/test', call_test);

function call_test(req, res) {
    var options = {
        args:
            [
                req.query.test1, // starting funds
                req.query.tes2, // (initial) wager size
                req.query.test3
            ]
    }

    PythonShell.run('./test.py', options, function (err, data) {
        if (err) res.send(err);
        res.send(data.toString())
    });
}
