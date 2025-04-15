const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const reviewController = require("../controllers/reviewController")
const reviewValidate = require("../utilities/review-validation")

// Process add review form
router.post(
    "/add",
    utilities.checkLogin,
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    utilities.handleErrors(reviewController.addReview)
)

// Process delete review
router.post(
    "/delete",
    utilities.checkLogin,
    utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router