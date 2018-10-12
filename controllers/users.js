const express = require("express"),
      router  = express.Router(),
      bcrypt = require("bcryptjs"),
      path = require("path"),
      crypto = require("crypto"),
      multer = require("multer"),
      GridFsStorage  = require("multer-gridfs-storage"),
      Grid = require("gridfs-stream"),
      mongoose = require("mongoose"),
      passport = require("passport"),
      isLoggedIn = require("../helpers/isLoggedIn"),
      User = require("../models/User");

const mongoURI = "mongodb://localhost:27017/just-like-that";

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
            return reject(err);
            }
            const filename = buf.toString('hex') + path.extname(file.originalname);
            const fileInfo = {
            filename: filename,
            bucketName: 'profileImages'
            };
            resolve(fileInfo);
        });
        });
    }
    });
const upload = multer({ storage });

let gfs;
const conn = mongoose.createConnection(mongoURI);
conn.once('open', function () {
   gfs = Grid(conn.db, mongoose.mongo);
   gfs.collection("profileImages");  
});

router.get("/login", (req, res) => {
    res.render("auth/login");
});

router.get("/register", (req, res) => {
    res.render("auth/register");
}); 

router.post("/register", upload.single('profileImageFile'), (req, res) => {
    req.checkBody("name", "The Name Field is Required!!!").notEmpty();
    req.checkBody("email", "The Email Field is Required!!!").notEmpty();
    req.checkBody("username", "The Username Field is Required!!!").notEmpty();
    req.checkBody("password", "The Password Field is Required!!!").notEmpty();
    req.checkBody("email", "Please Enter a Valid Email Address!!!").isEmail();
    req.checkBody("password2", "The Passwords Must Match").equals(req.body.password);

    const errors = req.validationErrors();
    
    if(errors){
        
        res.render("auth/register", {errors: errors});
    }else{
        User.findOne({email: req.body.email}, (err, mail) => {
            User.findOne({username: req.body.username}, (err, user) => {
                if(user || mail){
                    
                    res.render("auth/register", {
                        mail: mail,
                        user: user
                    });
                }else{
                    
                    const newUser = new User({
                        name: req.body.name,
                        username: req.body.username,
                        email: req.body.email,
                        password: req.body.password,
                        aboutYourself: req.body.aboutYourself || "No Information",
                        profileImage: req.file? req.file.filename : ""
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            else{
                                newUser.password = hash;
                                newUser.save().then((user) => {
                                    console.log(user);
                                    req.flash("success_msg", "You Have Successfully Created An Account And Can Login");
                                    res.redirect("/users/login");
                                });
                            }
                        });
                    });
                }
            });
        });
    }
}); 

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/users/login'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/user/' + user._id);
      });
    })(req, res, next);
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "You Have Successfully Logged Out");
    res.redirect("/users/login");
});

router.get("/images/:filename", (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        if(err) console.error(err);
        else{
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }
    });
});



module.exports = router;