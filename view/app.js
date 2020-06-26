angular.module("noteApp", ["ngRoute"]).controller("noteController", ["$scope", "$http", "notify", function($scope, $http, notify) {
    getSession();



    var socket = io.connect();

    $scope.callNotify = function(msg) {
        notify(msg);
    };




    //$scope.note = {};

    function getData() {
        $http.get('note').then(function(res) {
            //console.log(res.data)
            $scope.note = res.data;

        })
    }
    $scope.colorTable = ['red', '#008CBA', '#f44336', '#2e0950', '#555555', '#6e8c96', '#00ba28', '#ba0092']

    $scope.backgroundColor = function(color, user_utente) {
        console.log(color)
        $http({
            url: "color",
            method: "GET",
            params: {
                color: color,
                user_utente: user_utente
            } //passare user

        }).then(function(res) {
            console.log(res)
        }, function(res) {
            $scope.error = res.data;
        });

    }


    $scope.notaInsert = {};

    $scope.creaNota = function() {
        if (!$scope.notaInsert.nome) {
            return; // sweetAlert 2
        }
        $http.post('note', $scope.notaInsert).then(function(res) {
            // alert('Nota inserito correttamente: ' + $scope.nota.nome);
            getData();
        }, function(res) {
            $scope.error = res.data;
        });

    }

    $scope.eliminaNota = function(id) {
        $http.delete('note/' + id).then(function(res) {
            //alert('Nota eliminata correttamente!');
            getData();


        }, function(res) {
            $scope.error = res.data;
        });
    }

    $scope.aggiornaNota = function(id, cont) {

        var data = {
            cont: cont
        };
        $http.post('note/' + id, data).then(function(res) {
            //alert('Nota eliminata correttamente!');
            getData();
        }, function(res) {
            $scope.error = res.data;
        });
    }


    $scope.login = function(user, pass) {
        $http.post('login', {
            username: user,
            password: pass
        }).then(function(res) {

            console.log(user + "riga 81")

            $scope.user = res.data.user;
            console.log(user)
            getData();
            $scope.user_utente = user;
            console.log(user_utente + "ass")

        }, function(res) {
            alert('male male' + res.data.err);
        });
    }


    function getSession() {
        $http.get('session').then(function(res) {
            console.log("SESSION OK:" + res.data.user.user)
            console.log("SESSION OK COLOR:" + res.data.user.color)
            if (res.data.user.user) {
                $scope.user = res.data.user.user;
                $scope.userColor = res.data.user.color;
                $scope.user_utente = res.data.user.user.username;
                if ($scope.userColor) {
                    $("body").css({
                        transition: 'background-color 1s ease-in-out',
                        "background": "None",
                        "background-color": $scope.userColor
                    });
                }
                getData();
            } else {
                $scope.user = null;
            }
        }, function(res) {
            console.log("SESSION OK:" + res)
            $scope.user = null;
        });
    }
    getSession();

    $scope.logout = function() {
        $http.post("logout").then(function(res) {

            location.reload();
        });
    }
    $(document).ready(function() {


        socket.on('hello', function(myname) {
            $('#info').text("Your name is: " + myname);
        });
        socket.on('message', function(from, text) {
            $('#messages').append('<div><b>' + from + ':</b> ' + text + '</div>');
        });
        $('#message').keypress(function(e) {
            if ((e.keyCode || e.which) == 13) { //INVIO
                socket.emit('message', $('#message').val());
                $('#message').val('');
            }
        });
        /*socket.on('message2', function(color) {
            //console.log("ciao" + color)
            $("body").css({
                transition: 'background-color 1s ease-in-out',
                "background": "None",
                "background-color": color
            });

        });*/
        socket.on("updateNotes", function() {
            getData();

        });
        socket.on('changedColor', function(colorChanged, myUsername) {
            if (myUsername === $scope.user_utente) {
                $("body").css({
                    transition: 'background-color 1s ease-in-out',
                    "background": "None",
                    "background-color": colorChanged
                });
            }

        });



    });




    /* TEXTAREA*/
    /*$scope.textareaChanged = function() {
        console.log("ciao")
        getData();
        console.log("due")
    }*/


}]).factory('notify', ['$window', function(win) {
    var msgs = [];
    return function(msg) {
        msgs.push(msg);
        if (msgs.length === 3) {
            win.alert(msgs.join('\n'));
            msgs = [];
        }
    };


    /*-------- DIRETTIVE CUSTOM -------*/
}]).directive("myTable", function() {
    return {
        templateUrl: "/colorTable.html"
    };
});