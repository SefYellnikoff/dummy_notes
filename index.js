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



/* SOCKET. IO*/
var io = require('socket.io')(server);
//var io_cong = require('socket.io')

io.on('connection', function(socket) {
    console.log("socket connected", socket.id);
    socket.emit('hello', socket.id);
    socket.on('message', function(text) {
        io.emit('message', socket.id, text);
    });
    socket.emit("buttonColor", true);



    /**/
    /*setInterval(function() {
        console.log(getNotes())
        socket.emit('updateNotes', getNotes());
    }, 8000);*/
});




/*function chooseColor() {
    var color = Math.floor(Math.random() * Math.pow(256, 3)).toString(16);
    while (color.length < 6) {
        color = "0" + color;
    }
    return "#" + color;

}*/

/**SOCKET.IO */



app.use(session({
    key: "dummy_note",
    secret: "ciao123",
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        httpOnly: false // <- set httpOnly to false
    },
}));
var userMy = "";
app.post("/login", function(req, res) {
    //console.log(req.body);

    con.query("SELECT * FROM utenze WHERE username=? AND password=?", [req.body.username, req.body.password],
        function(err, data) {
            if (err) {
                return res.status(400).json({ err: "Errore di login" });
            }
            if (req.body.username === "common" && req.body.password === "common") {
                return res.status(400).json({ err: "denied" });
            } else {
                if (data.length > 0) {
                    req.session.user = data[0]; //
                    delete req.session.user.password;
                    res.json({ user: req.session.user });
                    userMy = req.body.username;
                    //console.log(userMy + "userm")

                } else {
                    return res.status(400).json({ err: "SICURAMENTE NON SONO I TUOI DATI" });
                }

            }
        });

});


app.get("/session", function(req, res) {
    //console.log("IN SESSION " + JSON.stringify(req.session))
    resSession = {
        user: req.session,
    }
    res.json(resSession);
});

app.use(function(req, res, next) {
    if (req.session.user == null) {
        res.json({ err: "Riprova" }); //viene eseguita prima
    } else {
        next();
    }

});





/* MOSTRA LE NOTE */


app.get('/note', function(req, res) {
    //console.log(req.session.user.username)
    con.query("SELECT * FROM note WHERE username = 'common' UNION (SELECT * FROM note WHERE username=?)", [req.session.user.username], function(err, data) {
        //console.log(req.session.user.username)
        if (err) {
            res.send({ err });
        } else {
            console.table(data);


            res.json(data);
            res.end();


        }

    });

});
app.get('/color', function(req, res) {
    //console.log("partita")
    //console.log(req.query.color)
    //console.log(req.query.user_utente)
    //console.log(req.query.user_utente)

    res.json(req.query.user_utente)

    req.session.color = req.query.color;

    var colorChanged = req.session.color;
    var sameUser = req.query.user_utente;
    req.session.save();
    //console.log(JSON.stringify(req.session))
    var mystring = JSON.parse(sameUser);
    //console.log(mystring)
    // console.log(mystring.username)
    var myUsername = mystring.username
    console.log(colorChanged, "holaaaaaaaaaaaaaaaaa")
    io.emit("changedColor", colorChanged, myUsername)
    res.end();
})



/* -----------------------*/

/* INSERIMENTO  NOTA */

app.post('/note', function(req, res) {

    con.query('INSERT INTO note (nome, contenuto, username) VALUES (?,?,?)', [req.body.nome, req.body.contenuto, req.session.user.username], function(err, data) {

        if (err) {
            throw err; //correggere con try catch
        } else {

            res.json(data);
            res.end();
            io.emit('updateNotes', true);
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
            io.emit('updateNotes', true);
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
            io.emit('updateNotes', true);
        }
    });

});


app.post('/logout', function(req, res, next) {
    delete req.session.user;
    res.end();
});

server.listen(config.port, function() {
    console.log("server starts on port: ", config.port);
});