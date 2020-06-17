angular.module("noteApp", []).controller("noteController", ["$scope", "$http", function($scope, $http) {

    function getData() {
        $http.get('note').then(function(res) {
            $scope.note = res.data;
        })
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
            $scope.user = res.data.user;
            getData();

        }, function(res) {
            alert('male male' + res.data.err);
        });
    }

    function getSession() {
        $http.get('session').then(function(res) {
            console.log("SESSION OK:" + res.data.user.user)
            if (res.data.user.user) {
                $scope.user = res.data.user.user;
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
        $http.get("logout", function() {
            window.reload()
        });
    }

}]);