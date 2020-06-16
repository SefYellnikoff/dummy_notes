var http = require('http');
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });


let config = nconf.get(); //prende tutta la conf del file config.js 


/*CONNESSIONE AL DB */
var mysql = require('mysql');
var con = mysql.createPool(config.db);





/* -----------------------*/

const express = require('express');
const app = express();
var session = require('express-session');
var storeMysql = require('express-mysql-session')(session);
var sessionStore = new storeMysql({}, con);
var server = http.createServer(app);
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' })); //middleware 
app.use(express.static(__dirname + '/view'));



app.use(session({ key: "dummy_note", secret: "ciao123", store: sessionStore, resave: false, saveUninitialized: false }));

app.post("/login", function(req, res) {
    console.log(req.body);

    con.query("SELECT * FROM utenze WHERE username=? AND password=?", [req.body.username, req.body.password],
        function(err, data) {
            if (err) {
                return res.status(400).json({ err: "Errore di login" });
            }
            if (data.length > 0) {
                req.session.user = data[0]; //
                delete req.session.user.password;
                res.json({ user: req.session.user });
                //req.session.save();
            } else {
                return res.status(400).json({ err: "SICURAMENTE NON SONO I TUOI DATI" });
            }
        });

});


app.get("/session", function(req, res) {
    resSession = {
        user: req.session
    }
    res.json(resSession);
});

/*app.use(function(req, res, next) {
    if (req.session.user == null) {
        res.status(400).json({ err: "Riprova" }); //viene eseguita prima
    } else {
        next();
    }
    next();
});*/







/* MOSTRA LE NOTE */
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
            throw err; //correggere con try catch
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
app.post('/note/:id', function(req, res) {



    con.query('UPDATE note set contenuto = ? WHERE id=?', [req.body.cont, req.params.id], function(err, data) {

        if (err) {
            throw err;
        } else {

            res.json(data);
            res.end();
        }
    });

});


/*app.get('/logout', function(req, res, next) { DA CONTINUARE
    delete req.session;
    res.redirect('/');
});*/

server.listen(config.port, function() {
    console.log("server starts on port: ", config.port);
});