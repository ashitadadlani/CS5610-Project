var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var db = mongoose.connect(process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost:test');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(session({ secret: 'this is the secret' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

var DealerSchema = new mongoose.Schema({
    name: String,
    phoneNo: Number,
    street: String,
    City: String,
    State: String,
    Country: String,
    zip: Number,
    website: String,
    id: String
});

var DealerModel = mongoose.model("DealerModel", DealerSchema);

var FavoriteSchema = new mongoose.Schema({
    styleid: Number,
    name: String,
    make: String,
    model: String,
    year: Number,
    zip: String,
    dealers: [DealerSchema]
});

var FavoriteModel = mongoose.model("FavoriteModel", FavoriteSchema);

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    favorites: [FavoriteSchema],
    subscription: [{ name: String, createdOn: { type: Date, default: Date.now }, make: String, model: String}]
});

var FeatureSchema = new mongoose.Schema(
	{
	    styleid: Number,
	    name: String,
	    drivenwheels: String,
	    cityFuelEconomy: String,
	    highwayFuelEconomy: String,
	    cylinders: String,
	    configuration: String,
	    fuelType: String,
	    gasType: String,
	    numOfDoors: String,
	    body: String,
	    transmissionnumberOfSpeeds: String,
	    transmissionType: String
	});

var FeatureModel = mongoose.model("FeatureModel", FeatureSchema);

var ImageSchema = new mongoose.Schema({
    styleid: Number,
    img: [String]
});

var ImageModel = mongoose.model("ImageModel", ImageSchema);

var EdmundReviewSchema = new mongoose.Schema(
		{
		    styleid: Number,
		    pros: String,
		    con: String,
		    edmundSays: String,
		    safety: String,
		    powerTrain: String,
		    whatsNew: String
		});

var EdmundReviewModel = mongoose.model("EdmundReviewModel", EdmundReviewSchema);

var ReviewSchema = new mongoose.Schema(
		{
		    stylename: String,
		    averagerating: Number,
		    author: String,
		    suggestedImprovements: String,
		    title: String,
		    favoriteFeatures: String,
		    otherComments: String
		});

var ReviewModel = mongoose.model("ReviewModel", ReviewSchema);

var CustomerReviewSchema = new mongoose.Schema(
		{
		    styleid: Number,
		    reviews: [ReviewSchema]
		});

var CustomerReviewModel = mongoose.model("CustomerReviewModel", CustomerReviewSchema);

var CarSchema = new mongoose.Schema(
    {
        make: String,
        model: String,
        year: Number,
        styleid: Number,
        name: String,
        features: [FeatureSchema]
    }
    );


var UserModel = mongoose.model("UserModel", UserSchema);

var CarModel = mongoose.model("CarModel", CarSchema);


passport.use(new LocalStrategy(
function (email, password, done) {
    UserModel.findOne({ email: email, password: password }, function (err, user) {
        if (user)
            return done(null, user);
        else
            return (null, false, { message: 'Unable to login' });
    })
}
));


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
})

app.post("/login", passport.authenticate('local'),
function (req, res) {
    var user = req.user;
    console.log(user);
    res.json(user);

});

app.post("/register/check", function (req, res) {
    var newUser = req.body;
    UserModel.findOne({ email: newUser.email }, function (err, user) {
        if (user) {
            res.json(403, { isTaken: true });
            return;
        }
        else
            res.send(200);
    });
});

app.get('/', function (req, res) {
    res.redirect('/home');
});

app.get("/home", function (req, res) {
    res.json(req.body);
});

app.get('/user/login', function (req, res) {
    UserModel.find(function (err, users) {
        console.log(users);
        res.json(users);
    })
});

app.get('/user/login/:email', function (req, res) {
    UserModel.findOne({ email: req.params.email }, function (err, user) {
        console.log(user)
        res.json(user);
    })
})

app.post("/register", function (req, res) {
    var newUser = req.body;

    UserModel.findOne({ email: newUser.email }, function (err, user) {
        if (err) { return next(err); }
        if (user) {
            res.json(null);
            return;
        }
        var newUser = new UserModel(req.body);
        newUser.save(function (err, user) {
            req.login(user, function (err) {
                if (err) { return next(err); }
                res.json(user);
            });
        });
    });
});

app.get('/loggedin', function (req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});

app.post("/logout", function (req, res) {
    req.logout();
    res.send(200);
})

var auth = function (req, res, next) {
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

app.post("/addToFavorite/car", function (req, res) {
    CarModel.findOne({ styleid: req.body.styleid }, function (err, car) {
        if (car) {
            res.json(null);
            return;

        }

        var newCar = new CarModel(req.body);
        newCar.save(function (err, car) {
            res.json(car);
        });
    });
});

app.get("/myFavorite/car/details/:id", function (req, res) {
    CarModel.findOne({ styleid: req.params.id }, function (err, car) {
        res.json(car);
       
    })
});

app.get("/myFavorite/car/feature/details/:sid", function (req, res) {
    FeatureModel.findOne({ styleid: req.params.sid }, function (err, feature) {
        res.json(feature);
    })
})

app.put("/user/addFavorites/:id", function (req, res) {
    UserModel.update({ _id: req.params.id }, { $set: { favorites: req.body.favorites } }, function (err, data) {
        UserModel.find(function (err, data) {

        })
    })
});

app.put("/user/subscription/:uid", function (req, res) {
    UserModel.update({ _id: req.params.uid }, { $set: { subscription: req.body.subscription } }, function (err, data) {
        UserModel.findOne({ _id: req.params.uid }, function (err, data) {
            res.json(data);
        })
    })
})

app.put("/profile/myFavorites/:id", function (req, res) {
    UserModel.update({ _id: req.params.id }, { $set: { favorites: req.body } }, function (err, data) {
        UserModel.findOne({ _id: req.params.id }, function (err, data) {
            
            res.json(data);
        })
    });
});

app.put('/user/:uid/favorite/:sid', function (req, res) {
    UserModel.update({ _id: req.params.uid }, { $set: { favorites: req.body.favorites } }, function (err, data) {
        UserModel.findOne({ _id: req.params.uid }, function (err, data) {
            res.json(data);
        })
    })
});

app.get("/profile/myFavorites/:id", function (req, res) {
    UserModel.findOne({ _id: req.params.id }, function (err, user) {

        res.json(user.favorites);
    })
});

app.get("/profile/myreviews/:username", function (req, res) {
    ReviewModel.find({ author: req.params.username} , function (err, data) {
        res.json(data);
    });
});

app.put("/car/user/addDealer/:uid/favorite/:fid", function (req, res) {
    UserModel.findById(req.params.uid, function (err, data) {
        data.firstName = req.body.firstName;
        data.lastName = req.body.lastName;
        data.username = req.body.username;
        data.password = req.body.password;
        data.email = req.body.email;
        data.favorites = req.body.favorites;
        data.save(function (err, result) {
            UserModel.findById(req.params.uid, function (err, doc) {
                res.json(doc);

            })
        })
    });
});

app.put("/profile/:uid/myFavorites/:styleid/dealer/", function (req, res) {
    UserModel.update({ _id: req.params.uid }, { $set: { favorites: req.body } }, function (err, data) {
        UserModel.findById(req.params.uid, function (err, data) {
            res.json(data);

        })
    })
});

app.get("/profile/mysubscription/:uid", function (req, res) {
    UserModel.findById(req.params.uid, function (err, data) {
        res.json(data.subscription);
    })
});

app.put("/profile/mysubscription/:uid", function (req, res) {
    UserModel.update({ _id: req.params.uid }, { $set: { subscription: req.body } }, function (err, data) {
        UserModel.findById(req.params.uid, function (err, user) {
            res.json(user);
        })
    })
});

app.get("/car/features/:sid", function (req, res) {
    FeatureModel.findOne({ styleid: req.params.sid }, function (err, data) {
        res.json(data);
    });
});

app.post("/car/features/:sid", function (req, res) {
    FeatureModel.findOne({ styleid: req.params.sid }, function (err, feature) {
        if (feature) {
            res.json(null);
            return;
        }
        else {
            var newFeature = new FeatureModel(req.body);
            newFeature.save(function (err, feature) {
                FeatureModel.findOne({ styleid: req.params.sid }, function (err, data) {
                    res.json(feature);
                })
            })
        }
    })
});

app.get("/car/images/:sid", function (req, res) {
    ImageModel.findOne({ styleid: req.params.sid }, function (err, images) {
        res.json(images);
    });
});

app.post("/car/images/:sid", function (req, res) {
    ImageModel.findOne({ styleid: req.params.sid }, function (err, feature) {
        if (feature) {
            res.json(null);
            return;
        }
        else {
            var newImage = new ImageModel(req.body);
            newImage.save(function (err, image) {
                ImageModel.findOne({ styleid: req.params.sid }, function (err, data) {
                    res.json(image);
                })
            });
        };
    });
});

app.post("/user/review/:author", function (req, res) {
    var review = new ReviewModel(req.body);
    review.save(function (err, data) {
        ReviewModel.find(function (err, data) {
            res.json(data);
        })
    })
})

app.get("/car/edmund/reviews/:sid", function (req, res) {
    EdmundReviewModel.findOne({ styleid: req.params.sid }, function (err, review) {
        res.json(review);
    });
});

app.post("/car/edmund/reviews/:sid", function (req, res) {
    EdmundReviewModel.findOne({ styleid: req.params.sid }, function (err, review) {
        if (review) {
            res.json(null);
            return;
        }
        else {
            var newReview = new EdmundReviewModel(req.body);
            newReview.save(function (err, review) {
                EdmundReviewModel.findOne({ styleid: req.params.sid }, function (err, data) {
                    res.json(data);
                })
            });
        };
    });
});

app.get("/car/customer/review/:sid", function (req, res) {
    CustomerReviewModel.findOne({ styleid: req.params.sid }, function (err, review) {
        res.json(review);
    });
});

app.post("/car/customer/review/:sid", function (req, res) {
    CustomerReviewModel.findOne({ styleid: req.params.sid }, function (err, review) {
        if (review) {
            res.json(null);
            return;
        }
        else {
            var newReview = new CustomerReviewModel(req.body);
            newReview.save(function (err, review) {
                CustomerReviewModel.findOne({ styleid: req.params.sid }, function (err, data) {
                    res.json(data);
                })
            });
        };
    });
});

app.put("/car/customer/review/:sid", function (req, res) {
    CustomerReviewModel.findOne({ styleid: req.params.sid }, function (err, data) {
        if (data) {
            CustomerReviewModel.update({ styleid: req.params.sid }, { $set: { reviews: req.body } }, function (err, data) {
                CustomerReviewModel.findOne({ styleid: req.params.sid }, function (err, data) {
                    res.json(data);
                })
            })
        }
        else {
            var review = { styleid: req.params.sid, reviews: req.body };
            var newReview = new CustomerReviewModel(review);
            newReview.save(function (err, data) {
                CustomerReviewModel.findOne({ styleid: req.params.sid }, function (err, review) {
                    res.json(review);
                })

            })
        }
    })
});


var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

app.listen(port, ip);