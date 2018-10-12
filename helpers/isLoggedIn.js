module.exports = function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("info_msg", "You Need To Be Logged In");
        res.redirect("/users/login");
    }
};