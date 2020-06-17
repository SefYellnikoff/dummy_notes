angular.module("noteApp", []).controller("noteController", ["$scope", "$http", function ($scope, $http) {
    var socket = io.connect();
    function getData() {
        $http.get('note').then(function (res) {
            $scope.note = res.data;
        })
    }



    $scope.notaInsert = {};

    $scope.creaNota = function () {
        if (!$scope.notaInsert.nome) {
            return; // sweetAlert 2
        }
        $http.post('note', $scope.notaInsert).then(function (res) {
            // alert('Nota inserito correttamente: ' + $scope.nota.nome);
            getData();
        }, function (res) {
            $scope.error = res.data;
        });

    }

    $scope.eliminaNota = function (id) {
        $http.delete('note/' + id).then(function (res) {
            //alert('Nota eliminata correttamente!');
            getData();


        }, function (res) {
            $scope.error = res.data;
        });
    }

    $scope.aggiornaNota = function (id, cont) {

        var data = {
            cont: cont
        };
        $http.post('note/' + id, data).then(function (res) {
            //alert('Nota eliminata correttamente!');
            getData();
        }, function (res) {
            $scope.error = res.data;
        });
    }

    $scope.login = function (user, pass) {
        $http.post('login', {
            username: user,
            password: pass
        }).then(function (res) {
            $scope.user = res.data.user;
            getData();

        }, function (res) {
            alert('male male' + res.data.err);
        });
    }

    function getSession() {
        $http.get('session').then(function (res) {
            console.log("SESSION OK:" + res.data.user.user)
            if (res.data.user.user) {
                $scope.user = res.data.user.user;
                getData();
            } else {
                $scope.user = null;
            }
        }, function (res) {
            console.log("SESSION OK:" + res)
            $scope.user = null;
        });
    }
    getSession();

    $scope.logout = function () {
        $http.post("logout").then(function (res) {

            location.reload();
        });
    }
    $(document).ready(function () {
        
    
        socket.on('hello', function (myname) {
            $('#info').text("Your name is: " + myname);
        });
        socket.on('message', function (from, text) {
            $('#messages').append('<div><b>' + from + ':</b> ' + text + '</div>');
        });
        $('#message').keypress(function (e) {
            if ((e.keyCode || e.which) == 13) { //INVIO
                socket.emit('message', $('#message').val());
                $('#message').val('');
            }
        });
    });
}]);