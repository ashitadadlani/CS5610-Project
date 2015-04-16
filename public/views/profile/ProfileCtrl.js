app.factory("UserService", function ($http) {

    var findAll = function (id, callback) {
        
        $http.get("/profile/myFavorites/" + id)
        .success(callback);
    };

    var removeCar = function (uid, fav, callback) {
        $http.put("/profile/myFavorites/" + uid, fav)
        .success(callback);
    };
    var details = function (styleid, callback) {
        $http.get("/myFavorite/car/details/" + styleid)
        .success(callback);
    };

    var removeDealer = function(uid, styleid, car, callback){
    	$http.put("/profile/" + uid + "/myFavorites/" + styleid + "/dealer", car)
    	.success(callback);
    }

    var myreviews = function (username, callback) {
        $http.get("/profile/myreviews/" + username)
        .success(callback);
    }

    var mySubscription = function(id, callback){
        $http.get("/profile/mysubscription/" + id)
        .success(callback);
    }

    var cancelSubscription = function (uid, subscriptions, callback) {
        $http.put("/profile/mysubscription/" + uid,  subscriptions)
        .success(callback);
    }
    
    return {
        findAll: findAll,
        removeCar: removeCar,
        details: details,
        removeDealer: removeDealer,
        myreviews: myreviews,
        mySubscription: mySubscription,
        cancelSubscription: cancelSubscription
    };

});

app.controller("ProfileCtrl",
function ($scope, $http, UserService, $rootScope) {
    
	$scope.isCollapsed = true;
	
    console.log($rootScope.currentUser);
    UserService.findAll($rootScope.currentUser._id, function (response) {
        $scope.favorites = response;

    });

    $scope.getDealers = function (favorite) {
    	$scope.isCollapsed = true;
        $scope.favdealers = [];
        $scope.favdealers = favorite.dealers;
        console.log("Dealers");
        
               $("#show-hide").toggle();
               
    };

    $scope.removeCar = function (car) { 
        for (var i in $scope.favorites) {
            if ($scope.favorites[i]._id == car._id) {
                $scope.index = i;
                break;
            }
        }
        $scope.user = $rootScope.currentUser;
        $scope.favorites.splice($scope.index, 1);
       
        UserService.removeCar($rootScope.currentUser._id, $scope.favorites, function (response) {
        	console.log("Removed");
            console.log(response);
            $rootScope.currentUser = response;
        } );
        
      $scope.favdealers = [];
    };

    $scope.getFavCarDetails = function (styleid) {
        UserService.details(styleid, function (response) {
            
            $scope.car = response;
        });
    };
    
    $scope.removeDealer = function (car, dealer) {
        for (var i in $scope.dealers) {
            if ($scope.dealers[i]._id == dealer._id) {
                $scope.index = i;
                break;
            }
        }

        for (var i in $scope.favorites) {
            if ($scope.favorites[i].styleid == car.styleid) {
                $scope.car = $scope.favorites[i];
                break;
            }
        }

        $scope.user = $rootScope.currentUser;
        $scope.car.dealers.splice($scope.index, 1);
        UserService.removeDealer($rootScope.currentUser._id, car.styleid, $scope.favorites, function (response) {
            $rootScope.currentUser = response;
            console.log(response);
        })
    };

  
    
        $scope.user = $rootScope.currentUser;
        UserService.myreviews($scope.user.username, function (response) {
            console.log(response);
            $scope.myReviews = response;
        });
            
        UserService.mySubscription($rootScope.currentUser._id, function (response) {
            $scope.mySubscriptions = response;
            console.log($scope.mySubscriptions);
        });
    	
        $scope.cancelSubscription = function (sid) {
            var index;
            for (var i in $scope.mySubscriptions) {
                if (sid == $scope.mySubscriptions[i]._id) {
                    index = i;
                    break;
                }
            }
            $scope.mySubscriptions.splice(index, 1);
            UserService.cancelSubscription($rootScope.currentUser._id, $scope.mySubscriptions, function (response) {
                $rootScope.currentUser = response;
                console.log(response);
            })
        }
});