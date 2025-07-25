if(process.env.NODE_ENV !="production"){
    require('dotenv').config();

}




const express = require('express');
const router = express.Router();
const Listing = require('../Models/listing');
const Review = require('../Models/review'); // Make sure Review model is imported
const wrapAsync = require('../utils/wrapAsync.js');
const multer  = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });
const { isLoggedIn,isOwner,validateListing } = require('../views/middleware.js');

const listingController = require("../controllers/listing.js");

router.route("/")
.get( wrapAsync(listingController.index))
.post( isLoggedIn,upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing)
);

// NEW ROUTE
router.get('/new', isLoggedIn,listingController.renderNewForm);



router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListng))
.delete( isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));



// EDIT ROUTE
router.get('/:id/edit', isLoggedIn,isOwner, wrapAsync(listingController.editListing));


module.exports = router;




