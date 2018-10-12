const express = require("express"),
      exphbs  = require("express-handlebars"),
      flash = require("connect-flash"),
      path  = require("path"),
      session  = require("express-session"),
      mongoose = require("mongoose"),
      passport = require("passport"),
      cookieParser = require("cookie-parser"),
      expressValidator = require("express-validator"),
      methodOverride = require("method-override");


const app = express(),
      port = (process.env.port || 5000);      

mongoose.connect("mongodb://localhost:27017/just-like-that", { useNewUrlParser: true });

const usersRouter = require("./controllers/users");
const indexRouter = require("./controllers/index");
const postsRouter = require("./controllers/posts");

require("./config/LocalStrategyConfig")(passport);

app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", exphbs({defaultLayout: "layout"}));
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(expressValidator());

app.use(session({
    secret: "xxxYYYzzz",
    saveUninitialized: false,
    resave: false
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.info_msg = req.flash("info_msg");
    res.locals.user = req.user || null;
    next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

app.use((req, res, next) => {
    res.status(404);
    res.render("errorViews/404", {layout: "errorLayout"});
});

app.use((err, req, res, next) => {
    res.status(500);
    res.render("errorViews/500", {layout: "errorLayout"});
});

app.listen(port, (err) => {
    if(err) throw err;
    else console.log(`App Started On Port ${port}`);
});