var app = angular.module("CarsApp", ['ngRoute' , 'ui.bootstrap']);

app.config(function ($routeProvider , $httpProvider) {
    $routeProvider
    .when('/home', {
        templateUrl: 'views/partials/home.html'
        
    })
        .when('/make/:make/model/:model/year/:year/style/:sid/zip/:zip', {
            templateUrl: 'views/partials/selectedNewCarStyle.html',
            controller: 'selectedNewCarStyleCtrl'
        })
        .when('/user/:email/make/:make/model/:model/year/:year/style/:sid/zip/:zip',{
        	templateUrl: 'views/partials/selectedNewCarStyle.html',
            controller: 'selectedNewCarStyleCtrl'
        })
        .when('/make/:make/model/:model/year/:year/style/:sid/zip/:zip/user/:email', {
            templateUrl: 'views/partials/selectedNewCarStyle.html',
            controller: 'selectedNewCarStyleCtrl'
        })
        .when('/profile', {
            templateUrl: 'views/profile/profile.html',
            controller: 'ProfileCtrl',
            resolve: {
                loggedin: checkLoggedin
            }
        })
        .when('/make/:make/model/:model/year/:year', {
            templateUrl: 'views/partials/selectedModel.html',
            controller: 'selectedModelCtrl'
        })
        .when('/make/model', {
            templateUrl: 'views/partials/selectedModel.html',
            controller: 'selectedModelCtrl'
        })
      .when('/login', {
          templateUrl: 'views/login/login.html',
          controller: 'LoginCtrl'
      })
      .when('/register', {
          templateUrl: 'views/register/register.html',
          controller: 'RegisterCtrl'
      })
        .when('/user/:userID/favorite/car/details/:id', {
            templateUrl: 'views/partials/myCar.html',
            controller: 'myFavoriteCarCtrl'
        })
    .otherwise({
        redirectTo: '/home'
    });
});



app.directive('rate', function () {
    return {
        restrict: 'A',
        template: '<ul class="rating">' +
        '<li ng-repeat="star in stars" ng-class="star">' +
        '\u2605' +
        '</li>' +
        '</ul>',
        scope: {
            ratingValue: '=',
            max: '='
        },
        link: function (scope, elem, attrs) {
            scope.stars = [];
            for (var i = 0; i < scope.max; i++) {
                scope.stars.push({
                    filled: i < scope.ratingValue
                });
            }
        }
    }
});


var checkLoggedin = function ($q, $timeout, $http, $location, $rootScope) {
    var deferred = $q.defer();

    $http.get('/loggedin').success(function (user) {
        $rootScope.errorMessage = null;
        // User is Authenticated
        if (user !== '0') {
            $rootScope.currentUser = user;
            deferred.resolve();
             }
            // User is Not Authenticated
        else {
            $rootScope.errorMessage = 'You need to log in.';
            deferred.reject();
            $location.url('/login');
        }
    });

    return deferred.promise;
};

app.controller('MainCtrl', function ($scope, $http, $rootScope, $location) {
	
	$scope.tabs = [
	               { title:'Dynamic Title 1', content:'Dynamic content 1' },
	               { title:'Dynamic Title 2', content:'Dynamic content 2'},
	               { title:'Dynamic Title 3', content:'Dynamic content 3'},
	               { title:'Dynamic Title 4', content:'Dynamic content 4'},
	             ];

    $scope.logout = function () {
        $http.post("/logout").
		success(function () {
		    $location.url("/login");
		    $rootScope.currentUser = null;
		    $rootScope.models = null;
		    $rootScope.years = null;
		    $rootScope.styles = null;
		})

    };

    $http.get("http://api.edmunds.com/api/vehicle/v2/makes?fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5")
   .success(function (response) {
       $rootScope.makes = response.makes;
       
       $rootScope.models = null;
       $rootScope.years = null;;
       $rootScope.styles = null;
    });

    $scope.fetchModels = function (make) {
       
        $scope.selectedMake = make;
        $rootScope.years = null;;
        $rootScope.styles = null;
        $http.get("http://api.edmunds.com/api/vehicle/v2/" + make.name + "/models?fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5")
        .success(function (response) {
            console.log(response.models);
            $rootScope.models = response.models;
            $('#model').addClass('open');
            
        });
    };

    $scope.fetchYears = function (model, make) {
        $scope.selectedModel = model;
        $http.get("http://api.edmunds.com/api/vehicle/v2/" + make.name + "/" + model.name + "/years?fmt=json&state=new&api_key=chfytaj2vn952t8hy2y6qtb5")
        .success(function (response) {
            console.log(response.years);
            $rootScope.years = response.years;
            $('#model').removeClass('open');
            $('#year').addClass('open');
        });
    };

    
});

