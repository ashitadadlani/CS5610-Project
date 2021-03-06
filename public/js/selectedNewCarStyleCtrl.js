﻿var res = $.get("http://ipinfo.io", function (response) {
    
}, "json");

app.factory("CarDetailService", function ($http) {

    var fetchEdmundReviewsFromAPI = function (make, model, year, callback) {
        $http.get("https://api.edmunds.com/v1/content/editorreviews?make=" + make + "&model=" + model + "&year=" + year + "&fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5")
        .success(callback);    
    };

    var fetchImagesFromAPI = function(styleid, callback){
        $http.get("http://api.edmunds.com/v1/api/vehiclephoto/service/findphotosbystyleid?styleId=" + styleid + "&fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5")
        .success(callback);
    };

    var fetchFeaturesFromAPI = function(styleid, callback){
        $http.get('https://api.edmunds.com/api/vehicle/v2/styles/' + styleid + '?fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5&view=full')
        .success(callback);
    };

    var fetchCustomerReviewsFromAPI = function (styleid, callback) {
        $http.get("https://api.edmunds.com/api/vehiclereviews/v2/styles/" + styleid + "?&fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5")
        .success(callback);
    };

    var fetchDealers = function (make, zipcode, callback) {
        $http.get("http://api.edmunds.com/api/dealer/v2/dealers/?zipcode=" + zipcode + "&radius=100&make=" + make + "&state=new&pageNum=1&pageSize=10&sortby=distance%3AASC&view=basic&api_key=chfytaj2vn952t8hy2y6qtb5")
        .success(callback);
    };

    var fetchPrice = function(styleid, zipcode, callaback){
        $http.get("https://api.edmunds.com/v1/api/tmv/tmvservice/calculatenewtmv?styleid=" + styleid + "&zip=" + zipcode + "&fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5")
        .success(callaback);
    };

    var fetchEdmundReviewsFromLocal = function(styleid, callback){
        $http.get("/car/edmund/reviews/" + styleid)
        .success(callback);
    };

    var fetchImagesFromLocal = function(styleid, callback){
        $http.get("/car/images/" + styleid)
        .success(callback);
    };

    var fetchFeaturesFromLocal = function(styleid, callback){
        $http.get("/car/features/" + styleid)
        .success(callback);
    };

    var fetchCustomerReviewsFromLocal = function(styleid, callback){
        $http.get("/car/customer/review/" + styleid)
        .success(callback);
    };

    var updateCustomerReview = function(styleid, newReview, callback){
        $http.post("/car/customer/review/" + styleid, newReview)
        .success(callback);
    }

    return {
        fetchEdmundReviewsFromAPI: fetchEdmundReviewsFromAPI,
        fetchImagesFromAPI: fetchImagesFromAPI,
        fetchFeaturesFromAPI: fetchFeaturesFromAPI,
        fetchCustomerReviewsFromAPI: fetchCustomerReviewsFromAPI,
        fetchDealers: fetchDealers,
        fetchPrice: fetchPrice,
        fetchEdmundReviewsFromLocal: fetchEdmundReviewsFromLocal,
        fetchImagesFromLocal: fetchImagesFromLocal,
        fetchFeaturesFromLocal: fetchFeaturesFromLocal,
        fetchCustomerReviewsFromLocal: fetchCustomerReviewsFromLocal,
        updateCustomerReview: updateCustomerReview
    }

})

app.controller("selectedNewCarStyleCtrl", function (CarDetailService, $scope, $http, $rootScope, $location, $routeParams) {
    
    $scope.make = $routeParams.make;
    $scope.model = $routeParams.model;
    $scope.year = $routeParams.year;
    $scope.styleid = $routeParams.sid;
    $scope.zipcode = $routeParams.zip;
    
    
    if($routeParams.email){
    	$http.get("/user/login/" + $routeParams.email).success(function (response) {
            console.log(response);
            $scope.user = response;
            $rootScope.currentUser = $scope.user;
    })
    }

    //get edmund reviews
    CarDetailService.fetchEdmundReviewsFromLocal($scope.styleid, function (response){
    	if(response){
    		$scope.editorial = response;
    	}
    	else{
    		CarDetailService.fetchEdmundReviewsFromAPI($scope.make, $scope.model, $scope.year, function (response) {
    			console.log(response);
    			$http.post("/car/edmund/reviews/" + $scope.styleid, {
    					styleid: $scope.styleid,
    	                pros: jQuery(response.editorial.pro).text(),
    	                con: jQuery(response.editorial.con).text(),
    	                edmundSays: jQuery(response.editorial.edmundsSays).text(),
    	                safety: jQuery(response.editorial.safety).text(),
    	                powerTrain: jQuery(response.editorial.powertrain).text(),
    	                whatsNew: jQuery(response.editorial.whatsNew).text()
    			})
    			.success(function (response){
    				$scope.editorial = response;
    				
    			})
    		})
    	}
    });

    //get images
    $scope.media = [];
    CarDetailService.fetchImagesFromLocal($scope.styleid, function (response){
    	if(response){
    		 
    		for (var i in response.img){
    			$scope.media[i] = response.img[i]; 
    		}
    		console.log("Images from local database");
    		console.log($scope.media);
    	}
    	else{
    		CarDetailService.fetchImagesFromAPI($scope.styleid, function (response) {
    			var img = [];
    			
    				for(var i in response)
    					img[i] = "http://media.ed.edmunds-media.com" + response[i].photoSrcs[0];
    				console.log(img);
    			
    				var imgModel = {
    						styleid: $scope.styleid,
    						img: img
    				}
    			
    				$http.post("/car/images/" + $scope.styleid, imgModel)
    				.success(function(response){
    					console.log(response);
    					$scope.first = response.img[0];
    					for (var i in response.img){
    						$scope.media[i] = response.img[i];
    					}
    				})
    			
    		});
    	}
    });

   //get price values
        CarDetailService.fetchPrice($scope.styleid, $scope.zipcode, function (response) {
            console.log(response.tmv);
            $scope.tmv = response.tmv;

        });
    
    CarDetailService.fetchFeaturesFromLocal($scope.styleid, function (response){
    	if(response){
    		$scope.features = response;
    		console.log("From local database");
    		
    	}
    	else{
    		CarDetailService.fetchFeaturesFromAPI($scope.styleid, function (response) {
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

    //get consumer reviews
    $scope.consumerReviews=[];
    $rootScope.details = null;
    CarDetailService.fetchCustomerReviewsFromLocal($scope.styleid, function (response){
    	if(response){
    		console.log("Customer reviews from local");
    		
    		$scope.consumerReviews = response.reviews;
    		
    	}
    	else{
    		CarDetailService.fetchCustomerReviewsFromAPI($scope.styleid, function (response) {
    			var review = [];
    			for(var i in response.reviews){
    			 review[i] = {
    					styleid: $scope.styleid,
    					author: response.reviews[i].author.authorName,
    					averagerating: response.reviews[i].averageRating,
    					title: response.reviews[i].title,
    					suggestedImprovements: response.reviews[i].suggestedImprovements,
    					favoriteFeatures: response.reviews[i].favoriteFeatures,
    					otherComments: response.reviews[i].text
    			};
    			}
    			var newReview = {
    					styleid: $scope.styleid,
    					reviews: review
    			};

    		    CarDetailService.updateCustomerReview($scope.styleid, newReview, function(response){
    				$scope.consumerReviews = response.reviews;
    				
    			})
    		});
    	}
    })

    //get dealers
        CarDetailService.fetchDealers($scope.make, $scope.zipcode, function (response) {
            console.log(response);
            $scope.dealers = response.dealers;
          
        });

    //get style

    $http.get("http://api.edmunds.com/api/vehicle/v2/makes?fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5")
   .success(function (response) {
       $rootScope.makes = response.makes;
       $scope.zipcode = res.responseJSON.postal;
   });

    $http.get("http://api.edmunds.com/api/vehicle/v2/" + $scope.make + "/models?fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5")
        .success(function (response) {
            console.log(response.models);
            $rootScope.models = response.models;

        });

    $http.get("http://api.edmunds.com/api/vehicle/v2/" + $scope.make + "/" + $scope.model + "/years?fmt=json&state=new&api_key=chfytaj2vn952t8hy2y6qtb5")
        .success(function (response) {
            console.log(response.years);
            $rootScope.years = response.years;
        });

    $http.get('https://api.edmunds.com/api/vehicle/v2/' + $scope.make + '/' + $scope.model + '/' + $scope.year + '/styles?fmt=json&api_key=chfytaj2vn952t8hy2y6qtb5&view=full')
        .success(function (response) {
            $rootScope.styles = response.styles;

            console.log(response.styles);
        });

    $scope.addToFavorites = function () {

        $http.get('/loggedin').success(function (user) {
            $rootScope.errorMessage = null;
            //			User is Authenticated
            if (user !== '0') {

                $scope.userId = user._id;
                var newFav = {
                    styleid: $scope.styleid,
                    name: $scope.features.name,
                    make: $scope.make,
                    model: $scope.model,
                    year: $scope.year,
                    zip: $scope.zipcode
                };


                $http.get('/user/login')
                    .success(function (response) {
                        for (var i in response) {
                            if (response[i]._id == $scope.userId) {
                                $scope.user = response[i];
                                break;
                            }
                        }

                        for (var i in $scope.user.favorites) {
                            if ($scope.user.favorites[i].styleid == $scope.styleid) {
                                $scope.styleExist = true;

                                break;
                            }
                        }

                        if ($scope.styleExist) {
                            ;
                        }
                        else {
                            $scope.user.favorites.push(newFav);
                            console.log(user.favorites);
                            $http.put("/user/addFavorites/" + $scope.user._id, $scope.user);

                            console.log($scope.features);
                            var newCar = {
                                make: $scope.make,
                                model: $scope.model,
                                year: $scope.year,
                                styleid: $scope.styleid,
                                name: $scope.features.name,
                                features: [$scope.features]
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
    };

    $scope.subscribe = function () {
        $http.get('/loggedin').success(function (user) {
            if (user !== '0') {
                $scope.userId = user._id;

                $http.get('/user/login')
                        .success(function (response) {
                            for (var i in response) {
                                if (response[i]._id == $scope.userId) {
                                    $scope.user = response[i];
                                    break;
                                }
                            }

                            var newSubscription = {
                                createdOn: Date.now,
                                name: $scope.features.name,
                                make: $scope.make,
                                model: $scope.model
                            }

                            var isExist = false;
                            for (var i in $scope.user.subscription) {
                                if ($scope.user.subscription[i].name == $scope.features.name) {
                                    isExist = true;
                                    break;
                                }
                            }

                            if (isExist == false) {
                                $scope.user.subscription.push(newSubscription);

                                $http.put("/user/subscription/" + $scope.user._id, $scope.user)
                                .success(function (response) {
                                    console.log(response);
                                    $scope.currentUser = response;
                                });
                            }
                        })
            }
            else {

                $location.url('/login');
            }
        });
    }

    $scope.getDealersByZipcode = function (zip) {
    	
        $rootScope.priceClicked = false;
        $rootScope.details = null;
        $rootScope.clickedFeatures = false;
        $rootScope.clickedDealers = true;
        $rootScope.reviewClicked = false;
        $rootScope.consumerReviewClicked = false;
        $location.url('/make/' + $scope.make + '/model/' + $scope.model + '/year/' + $scope.year + '/style/' + $scope.styleid + '/zip/' + zip);
    };


    $scope.getDetails = function (dealer) {
        $scope.details = dealer;
    };

    $scope.addReview = function(){
    	$scope.newReviewToAdd = true;
    	$http.get('/loggedin').success(function(user)
    	        { 
    	            $rootScope.errorMessage = null;
    	            //			User is Authenticated
    	            if (user !== '0') {
    	                
    	                $scope.userId = user._id;
    	                
    	                $http.get('/user/login')
    	                    .success(function (response){
    	                    for (var i in response) {
    	                        if(response[i]._id == $scope.userId){
    	                            $scope.user = response[i];
    	                            break;
    	                        }
    	                    }
    	                    
    	                    
    	            })
    	            }
    	            else {
    	                
    	                $location.url('/login');
    	            }
    	        });
    	                    
    };
    
    $scope.cancelReview = function(){
    	$scope.newReviewToAdd = false;
    };
    
    $scope.submitReview = function(review){
    	
    	$scope.newReviewToAdd = false;
    	
    	$http.get('/user/login')
        .success(function (response){
        for (var i in response) {
            if(response[i]._id == $scope.userId){
                $scope.user = response[i];
                break;
            }
        }
        
        var newReview = {
        		stylename: $scope.features.name,
        		averagerating: review.rating,
    			author: $scope.user.username,
    			suggestedImprovements: review.suggestedImprovements, 
    			title: review.title,
    			favoriteFeatures: review.favoriteFeatures,
    			otherComments: review.otherComments
        }
        
        $http.post("/user/review/" + $scope.user.username, newReview)
            .success(function (response) {
                console.log(response);
            });

        $scope.consumerReviews.push(newReview);
        
        
        $http.put("/car/customer/review/" + $scope.styleid, $scope.consumerReviews)
        .success(function(response){
        	console.log(response);
        	$scope.consumerReviews = response.reviews;
        })
        })
    }
    
    
    $scope.addToCheckList = function (dealer) {

        $http.get('/loggedin').success(function (user) {
            $rootScope.errorMessage = null;

            if (user !== '0') {

                $scope.userId = user._id;

                $scope.IDstyle = $scope.styleid;

                console.log(typeof dealer.contactInfo != undefined);
                if(!(dealer.contactInfo)){
                		var newDealer = {
                			name: dealer.name,
                			id: dealer.dealerId,
                			street: dealer.address.street,
                			City: dealer.address.city,
                			State: dealer.address.stateName,
                			Country: dealer.address.country,
                			zip: dealer.address.zipcode,
                			website: ""
                		
                	}
                }
                else{
                	var newDealer = {
                            name: dealer.name,
                            id: dealer.dealerId,
                            street: dealer.address.street,
                            City: dealer.address.city,
                            State: dealer.address.stateName,
                            Country: dealer.address.country,
                            zip: dealer.address.zipcode,
                            website: dealer.contactInfo.website
                        }
                }
                
                
                $http.get('/user/login')
                .success(function (response) {
                    for (var i in response) {
                        if (response[i]._id == $scope.userId) {
                            $scope.user = response[i];
                            break;
                        }
                    }
                    console.log($scope.user.favorites.length == 0);

                    for (var i in $scope.user.favorites) {
                        if ($scope.user.favorites[i].styleid == $scope.IDstyle) {
                            $scope.favStyle = $scope.user.favorites[i];
                            $scope.index = i;
                            console.log(i);
                            break;
                        }
                    }
                    
                    $scope.dealerExist = false;
                    
                    if($scope.favStyle != undefined){                  
                    
                    	for(var i in $scope.favStyle.dealers){
                    		if($scope.favStyle.dealers[i].id == dealer.dealerId){
                    			$scope.dealerExist = true;
                    			break;
                    		}
                    	}
                    	
                    if($scope.dealerExist == false){	
                    $scope.favStyle.dealers.push(newDealer);
                    console.log($scope.favStyle);
                    $http.put('/user/' + $scope.userId + '/favorite/' + $scope.IDstyle, $scope.user)
                    .success(function (response){
                    	$rootScope.currentUser = response;
                    });
                    }
                    }
                    else{
                    	$scope.addToFavorites();
                    	$scope.addToCheckList(dealer);

                    }
                    
                })
            }
            
            else{
            	$location.url("/login");
            }

        })
    }

    $scope.myInterval = 5000;
    $scope.oneAtATime = true;
});

app.controller("carousel", function($scope){
	 
})
