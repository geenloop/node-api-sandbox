angular.module('indexCtrl', [

]);

angularApp.component('index', {
    templateUrl: '/templates/index.html'
}).controller('indexCtrl', function indexCtrl($scope, $location, $http, $mdToast, $mdDialog, $window) {
    $scope.generate = function() {
        $window.location = '/backup';
        $mdDialog.hide();
        $mdToast.show(
            $mdToast.simple()
                .textContent("Downloading BackUp file... now")
                .position("bottom right")
                .hideDelay(3333)
        );
    };

    $scope.upload = function() {
        var formData = new FormData();
        formData.append('file', $scope.file);
        console.log(formData);
        $http.post('/backup', formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function () {
            $mdDialog.hide();
            $mdToast.show(
                $mdToast.simple()
                    .textContent("Database was restored from BackUp file")
                    .position("bottom right")
                    .hideDelay(3333)
            );
        });
    };
});