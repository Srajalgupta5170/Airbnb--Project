const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./Models/user.js');

const listingRouter = require ("./routes/listing.js");
const reviewRouter = require ("./routes/review.js");
const userRouter = require ("./routes/user.js");

// const mongoose_url = "mongodb://127.0.0.1:27017/Wanderlust";
const dbUrl =process.env.ATLASDB_URL;

main()
.then(()=>{
  console.log("connected to DB");
})
.catch((err) => {
  console.error("Error connecting to the database:", err);
}); 

async function main(){
  await mongoose.connect(dbUrl);

}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
    touchAfter:24*3600,

});

store.on("error",()=>{
  console.log("ERROR IN MONGO STORE",err);
});

const sessionOptions ={
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly: true,
    expire: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  },
};


// app.get('/', (req, res) => {
//   res.send('Heello,I am a root');
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user;
  next();
});

// app.get("/demoUser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student435@gmail.com",
//     username: "student435",
//   });
//  let registeredUser = await User.register(fakeUser,"HelloWorld");
//  res.send(registeredUser);
// });


    app.use("/listings",listingRouter);
    app.use("/listings/:id/reviews",reviewRouter);
    app.use("/",userRouter);



// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title:"My new villa",
//     description:"A beautiful villa with a sea view",
//     price: 15000,
//     image:"https://unsplash.com/photos/a-view-of-a-small-town-from-a-hill-CQALAwcgTgo",
//     location:"Goa",
//     country:"India",
//   });

// await sampleListing.save();
// console.log("Sample was saved");
// res.send("Successfull");

// });
 app.all(/.*/, (req, res, next) => {
     next(new ExpressError(404, 'Page Not Found'));
    
    });
    
    
    
    app.use((err, req, res, next) => {
      const { statusCode = 500, message = 'Something went wrong!' } = err;
      // res.status(statusCode).send(message);
      res.status(statusCode).render("error.ejs", {message } );
    
    });





app.listen(8080, () => {
  console.log('Server is running on port 8080');
});



