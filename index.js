var http = require('http');

/*CONNESSIONE AL DB */
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "sefora",
    password: "sefora",
    database: "node_db"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});



/* -----------------------*/

const express = require('express');
const app = express();
var server = http.createServer(app);
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname + '/view'));




/* MOSTRO LE NOTE */
app.get('/note', function(req, res) {

    con.query('SELECT * from note', function(err, data) {

        if (err) {
            res.send({ err });
        } else {
            console.table(data);

            res.json(data);
            res.end();
        }

    });
});

/* -----------------------*/

/* INSERIMENTO  NOTA */

app.post('/note', function(req, res) {



    con.query('INSERT INTO note set ?', [req.body], function(err, data) {

        if (err) {
            throw err;
        } else {

            res.json(data);
            res.end();
        }
    });

});

/*CANCELLA NOTA*/

app.delete('/note/:id', function(req, res) {
    con.query("DELETE from note WHERE id= ?", [req.params.id], function(err, data) {
        if (err) {
            throw err;
        } else {
            res.end();
        }
    });
});

/* -----------------------*/

/* UPDATE NOTA continuare....*/
app.post('/note/delete', function(req, res) {



    con.query('UPDATE note set ?', [req.body], function(err, data) {

        if (err) {
            throw err;
        } else {

            res.json(data);
            res.end();
        }
    });

});

server.listen(8085, function() {});