app.factory("LoginService", function($http)
	{
		var login = function(user, callback)
		{
			$http.post("/login", user)
	        .success(callback);
		}
		
		return {
			login: login
		}
	});

app.controller("LoginCtrl", function ($scope, $http, LoginService, $location, $rootScope) {
    $scope.login = function (user) {
    	$rootScope.loginFailureMessage = "";
        LoginService.login(user, function (response) {
            $rootScope.currentUser = response;
            $location.url("/profile");
            $rootScope.loginFailureMessage = "";
        })
        if($rootScope.currentUser == null)
        	$scope.loginFailureMessage = "Invalid email or password!!";
    }
});