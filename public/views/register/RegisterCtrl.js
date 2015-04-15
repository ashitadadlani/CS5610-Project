app.directive('uniqueEmail', ['$http', function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.busy = false;
            scope.$watch(attrs.ngModel, function (value) {

                // hide old error messages
                ctrl.$setValidity('isTaken', true);
                ctrl.$setValidity('invalidChars', true);

                if (!value) {
                    return;
                }

                scope.busy = true;
                $http.post('/register/check', { email: value })
                  .success(function (data) {
                      // everything is fine -> do nothing
                      scope.busy = false;
                  })
                  .error(function (data) {

                      // display new error message
                      if (data.isTaken) {
                          ctrl.$setValidity('isTaken', false);
                      } else if (data.invalidChars) {
                          ctrl.$setValidity('invalidChars', false);
                      }
                      scope.busy = false;
                  });
            })
        }
    }
}]);


app.controller("RegisterCtrl", function($scope, $http, $location, $rootScope){
    $scope.register = function(user){
        console.log(user);
        $rootScope.message = "";
        if(user.password != user.password2 || !user.password || !user.password2)
        {
            $rootScope.message = "Your passwords don't match";
        }
        else
        {
            $http.post("/register", user)
            .success(function(response){
                console.log(response);
                if(response != null)
                {
                    $rootScope.currentUser = response;
                    $location.url("/profile");
                }
            });
        }
    }
});