//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require(`lodash`);
const mongoose = require(`mongoose`);
const blogmod = require(`./models/blog`);
const fileUpload = require("express-fileupload");
const cloudinary = require("./cloudinary");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { db } = require("./models/blog");



const app = express();

app.use(fileUpload({
  useTempFiles : true
}));

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
  secret:"Our litlle secret.",
  resave:false,
  saveUninitialized:false,
}));
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3000;
mongoose.connect(`mongodb://localhost:27017/blogDB`,{useNewUrlParser : true})
    .then( res => {console.log("blogDB connection successful")})
    .catch( err => {console.log("blogB connection failed")});
// mongoose.connect('mongodb://localhost:27017/cmsUserDB',{useNewUrlParser : true})
//     .then( res => {console.log("cmsUserDB connection successful")})
//     .catch( err => {console.log("cmsUserB connection failed")});
// mongoose.connect('mongodb://localhost:27017/cmsAdminDB',{useNewUrlParser : true})
//     .then( res => {console.log("cmsAdminDB connection successful")})
//     .catch( err => {console.log("cmsAdminDB connection failed")});


const userSchema = new mongoose.Schema({
  email:String,
  password:String
});
const adminSchema = new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(passportLocalMongoose);
adminSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res) => {
  res.render("login")
});

app.get(`/home`,(req, res) =>{
  if(req.isAuthenticated()){
    blogmod.find({}, (err, posts)=>{
      res.render(`home`,{
        hsc : homeStartingContent,
        posts : posts
      });
    });
  }else{
    res.redirect("/")
  }
  
});

app.get(`/about`, (req,res)=>{
  res.render(`about`, {ac:aboutContent});
})

app.get(`/contact`, (req,res)=>{
  res.render(`contact`, {cc:contactContent});
})

app.get(`/compose`, (req,res)=>{
  res.render(`compose`);
})
app.get("/register",function(req,res){
  res.render("register")
});
app.get("/admin",function(req,res){
  res.render("admin")
});
app.get("/logout",(req,res) =>{
  req.logout();
  res.redirect("/");
})


app.post(`/compose`, (req,res)=>{
  const img = req.files.postImg;
  cloudinary.uploader.upload(img.tempFilePath, (err, result) => {
    console.log(result);
    const Post = new blogmod({
    title:  req.body.posttitle,
    img : result.url,
    content : req.body.postbody
 })
 Post.save((err) => {
  if(!err) res.redirect(`/`);
 });
  })
  
  
})

app.get(`/posts/:postId`,(req,res)=>{
  const id = req.params.postId;
  blogmod.findOne({_id:id},(err, Post)=>{
    res.render(`post`, {title: Post.title,img : Post.img, body : Post.content});
  });
});

app.post("/register",(req,res) => {
  User.register({username:req.body.username},req.body.password,(err,user) => {
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,() => {
        res.redirect("/")
      })
    }
  });
});

app.post("/login",(req,res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user,(err)=>{
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,() => {
        res.redirect("/home")
      })
    }
  })
});
app.post("/admin",(req,res) => {
  const admin = new User({
    username: req.body.username,
    password: req.body.password
  });

})



app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});
