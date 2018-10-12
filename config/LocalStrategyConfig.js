const LocalStrategy = require("passport-local").Strategy,
      mongoose = require("mongoose"),
      bcrypt = require("bcryptjs"),
      User = require("../models/User");



module.exports = function(passport){
    passport.use(new LocalStrategy(
        function(username, password, done){
            User.findOne({username: username}, (err, user) => {
                if(!user){
                    return done(null, false, {message: "Unknow User!!!"});
                }else{
                    bcrypt.compare(password, user.password, (err, match) => {
                        if(match){
                            return done(null, user);
                        }else{
                            return done(null, false, {message: "Wrong Password!!!"});
                        }
                    });
                }
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
    });
}


