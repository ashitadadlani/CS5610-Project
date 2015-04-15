app.controller("FeatureCtrl", function ($scope, $http, $rootScope, $location, $routeParams){
	$scope.styleid = $routeParams.sid;
	
	$http.get("/car/features/" + $scope.styleid)
    .success(function (response){
    	if(response){
    		$scope.features = response;
    		console.log("From local database");
    		console.log($scope.features);
    	}
    	else{
    		$http.get('https://api.edmunds.com/api/vehicle/v2/styles/' + $scope.styleid + '?fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5&view=full')
    		.success(function (response) {
    			$scope.style = response;
    			$http.post("/car/features/" + $scope.styleid, {
    				styleid: $scope.styleid,
                    name: response.name,
                    drivenwheels: response.drivenWheels,
                    cityFuelEconomy: response.MPG.city,
                    highwayFuelEconomy: response.MPG.highway,
                    cylinders: response.engine.cylinder,
                    configuration: response.engine.configuration,
                    fuelType: response.engine.fuelType,
                    gasType: response.engine.type,
                    numOfDoors: response.numOfDoors,
                    body: response.submodel.body,
                    transmissionnumberOfSpeeds: response.transmission.numberOfSpeeds,
                    transmissionType: response.transmission.transmissionType
    			})
    			.success(function (response){
    				$scope.features = response;
    			})
    		});
    	}
    });
});