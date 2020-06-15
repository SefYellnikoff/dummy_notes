angular.module("noteApp", []).controller("noteController", ["$scope", "$http", function($scope, $http) {

    function getData() {
        $http.get('note').then(function(res) {
            $scope.note = res.data;
        })
    }
    getData();

    $scope.nota = {};

    $scope.creaNota = function() {
        $http.post('note', $scope.nota).then(function(res) {
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
            clear();

        }, function(res) {
            $scope.error = res.data;
        });
    }


}]);