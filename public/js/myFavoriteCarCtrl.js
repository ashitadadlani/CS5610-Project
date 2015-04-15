app.factory("FavCarService", function ($http) {

    var getFeatures = function (styleid, callback) {
        $http.get("/myFavorite/car/feature/details/" + styleid)
        .success(callback);
    };

    return {
    	getFeatures: getFeatures
    }

});

app.controller("myFavoriteCarCtrl", function ($scope, $http, $rootScope, FavCarService, $routeParams) {

    $scope.styleid = $routeParams.id;
    console.log($scope.styleid);
    $scope.userid = $routeParams.userID;
    console.log($scope.userid);

    $http.get("/user/login/" + $scope.userid).success(function (response) {
        console.log(response);
        $scope.user = response;
        $rootScope.currentUser = $scope.user;

        FavCarService.getFeatures($scope.styleid, function (response)
        {
            $scope.features = response;
        });
        
        FavCarService.get

    });
})