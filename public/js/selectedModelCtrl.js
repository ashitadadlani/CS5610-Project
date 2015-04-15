
app.filter('offset', function () {
    return function (input, start) {
        start = parseInt(start, 10);
        return input.slice(start);
    };
});

var res = $.get("http://ipinfo.io", function (response) {
    
}, "json");

app.controller("selectedModelCtrl", function ($scope, $http, $rootScope, $routeParams) {

	$scope.make = $routeParams.make;
	$scope.model = $routeParams.model;
	$scope.year1 = $routeParams.year;
	$scope.itemsPerPage = 5;
    $scope.currentPage = 0;
	
        $http.get('https://api.edmunds.com/api/vehicle/v2/' + $scope.make + '/' + $scope.model + '/' + $scope.year1 + '/styles?fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5&view=full')
        .success(function (response) {
            $scope.styles = response.styles;
            $scope.zipcode = res.responseJSON.postal;
            
            $scope.prevPage = function () {
                if ($scope.currentPage > 0) {
                    $scope.currentPage--;
                }
            };

            $scope.prevPageDisabled = function () {
                return $scope.currentPage === 0 ? "disabled" : "";
            };

            $scope.pageCount = function () {
                
                return Math.ceil($scope.styles.length / $scope.itemsPerPage) - 1;
            };
            $scope.nextPage = function () {
                if ($scope.currentPage < $scope.pageCount()) {
                    $scope.currentPage++;
                }
            };

            $scope.nextPageDisabled = function () {
                return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
            };

            $scope.setPage = function (n) {
                $scope.currentPage = n;
            };
        
       
        });

    
        $scope.addToFavorites = function (style) {
            
            $http.get('/loggedin').success(function(user)
            { 
                $rootScope.errorMessage = null;
                //			User is Authenticated
                if (user !== '0') {
                    
                    $scope.userId = user._id;
                    var newFav = {
                        styleid: style.id,
                        name: style.name,
                        make: style.make.name,
                        model: style.model.name,
                        year: style.year.year,
                        zip: $scope.zipcode
                    };

                    
                    $http.get('/user/login')
                        .success(function (response){
                        for (var i in response) {
                            if(response[i]._id == $scope.userId){
                                $scope.user = response[i];
                                break;
                            }
                        }
                        
                        for (var i in $scope.user.favorites) {
                            if ($scope.user.favorites[i].styleid == style.id) {
                                $scope.styleExist = true;
                               
                                break;
                            }
                        }

                        if($scope.styleExist){
                        	;
                        }
                        else{
                        	$scope.user.favorites.push(newFav);
                        	
                        	$http.put("/user/addFavorites/" + $scope.user._id, $scope.user);
                        	
                        	var newCar = {
                        			make: $scope.make,
                        			model: $scope.model,
                        			year: $scope.year1,
                        			styleid: style.id,
                        			name: style.name,
                        			features: {
                        				styleid: style.id,
                                        name: style.name,
                                        drivenwheels: style.drivenWheels,
                                        cityFuelEconomy: style.MPG.city,
                                        highwayFuelEconomy: style.MPG.highway,
                                        cylinders: style.engine.cylinder,
                                        configuration: style.engine.configuration,
                                        fuelType: style.engine.fuelType,
                                        gasType: style.engine.type,
                                        numOfDoors: style.numOfDoors,
                                        body: style.submodel.body,
                                        transmissionnumberOfSpeeds: style.transmission.numberOfSpeeds,
                                        transmissionType: style.transmission.transmissionType
                        			}
                        	};
                        	$http.post("/addToFavorite/car", newCar)
                            .success(function (response) {
                                console.log(response);
                            });

                        }
                    });
                    }
                 else {
                    
                    $location.url('/login');
                }
            });  
                }

    

});
