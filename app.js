     if(process.env.NIDE_ENV !="production"){
         require('dotenv').config();
     }
      
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js")
const session=require("express-session");
const mongoStore=require('connect-mongo');

const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const Listing=require("./models/listing.js");
const userRouter=require("./routes/user.js");
const { isLoggedIn } = require('./middleware.js');
app.engine("ejs",ejsMate);

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname,"/public")));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
let port=8080;
const wrapAsync= (fn)=>{
  return (req,res,next)=>{
     fn(req,res,next).catch(next);
  }
};
class ExpressError extends Error{
  constructor(statuscode,message){
     super();
     this.statuscode=statuscode;
     this.message=message;
  } 
};

const dbUrl=process.env.ATLASDB_URL;
main().then(()=>{ 
  console.log("welcome to database:");
}).catch(err=>{
   console.log(err);
}); 
async function main(){
  await mongoose.connect(dbUrl);
}
const store=mongoStore.create({
  mongoUrl:dbUrl,
  crypto: {
    secret:process.env.SECRET,
  },
  touchAfter: 24*3600,
});

store.on("error",()=>{
  console.log("session store error",err);
});

 const sessionOptions={
  store:store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOlny:true
  }

 };

 

 app.use(session(sessionOptions));
 app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

 


app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  
  next();
});  



app.get("/profile",isLoggedIn,async(req,res)=>{ 
  let id=res.locals.currUser._id;
 let user=await User.findById(id);
 let listings=await Listing.find({owner:id});
 console.log(user)
res.render("listings/profile.ejs",{user,listings});
});
app.get("/messages",isLoggedIn,async(req,res)=>{
  res.send("NO Message Yet!"); 
});
app.get("/",(req,res)=>{
  res.redirect("/listings");
});
app.use("/listings",listingRouter);

app.use("/listings/:id/reviews",reviewRouter);

app.use("/",userRouter);



app.listen(port,()=>{
  console.log("Server is running on port "+port);
});

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found!"));
});

app.use((err,req,res,next)=>{
  let {statuscode=500,message="something went wrong"}=err;
   res.status(statuscode).send(message);
});