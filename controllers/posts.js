const express = require("express"),
      router  = express.Router(),
      mongoose = require("mongoose"),
      multer = require("multer"),
      Grid = require("gridfs-stream"),
      GridFsStorage = require("multer-gridfs-storage"),
      path = require("path"),
      crypto = require("crypto"),
      Post = require("../models/Post");


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
        bucketName: 'postImages'
        };
        resolve(fileInfo);
    });
    });
}
});
const upload = multer({ storage });

let gfs;
var conn = mongoose.createConnection(mongoURI);
conn.once('open', function () {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("postImages");
});

router.get("/addPost", (req, res) => {
    res.render("posts/addPost");
});

router.post("/addPost", upload.single('postImage'), (req, res) => {
    req.checkBody("title", "The Movie Titile Is Mandatory!!!").notEmpty();
    req.checkBody("description", "The Movie Description Is Mandatory!!!").notEmpty();

    const errors = req.validationErrors();
    
    if(errors){
        res.render("posts/addPost", {errors: errors})
    }else{
        const newPost = new Post({
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            postImage: req.file? req.file.filename : "",
            userId: req.user._id
        });

        newPost.save().then((post) => {
            console.log(post);
            req.flash("success_msg", "You Successfully Added A New Post");
            res.redirect("/profile/" + req.user._id);
        });
    }
});

router.get("/image/:filename", (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        if(err) throw err;
        else{
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }
    });
});

router.delete("/remove/:id", (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if(err) throw err;
        else{
            post.remove().then((post) => {
                console.log(post);
                res.redirect("/profile/" + req.user._id);
            });
        }
    });
});

router.get("/edit/:id", (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if(err) throw err;
        else{
            res.render("posts/editPost", {post: post}); 
        }
    });
});

router.put("/edit/:id", upload.single("newPostImage"), (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if(err) throw err;
        else{
            post.title = 
            req.body.newTitle? req.body.newTitle : post.title;
            post.description = 
            req.body.newDescription? req.body.newDescription : post.description;
            post.postImage = 
            req.file? req.file.filename : post.postImage;
            post.rating = 
            req.body.newRating? req.body.newRating : post.rating;

            post.save().then((post) => {
                
                res.redirect("/profile/" + req.user._id);
            });
        }
    });
});

module.exports = router;