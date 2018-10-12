const express = require("express"),
      router  = express.Router(),
      isLoggedIn = require("../helpers/isLoggedIn"),
      User = require("../models/User"),
      Post = require("../models/Post");

router.get("/", isLoggedIn, (req, res) => {
    res.render("index");
});

router.get("/user/:id", isLoggedIn, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err) throw err;
        else{
            res.render("index", {user: user});
        }
    });
});

router.get("/profile/:id", isLoggedIn, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err) throw err;
        Post.find({userId: req.params.id}, (err, posts) => {
            res.render("profile", {user: user, posts: posts});
        });
    });
});

module.exports = router;