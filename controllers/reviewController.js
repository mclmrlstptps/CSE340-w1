const utilities = require("../utilities")
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")

const reviewCont = {}

/* ***************************
 *  Process add review
 * ************************** */
reviewCont.addReview = async function (req, res) {
    const { inv_id, review_rating, review_text } = req.body
    const account_id = res.locals.accountData.account_id

    // Check if the vehicle exists
    const vehicle = await invModel.getInventoryByInventoryId(inv_id)
    if (!vehicle) {
        req.flash("notice", "Vehicle not found")
        return res.redirect("/inv/")
    }

    // Check if user already reviewed this vehicle
    const hasReviewed = await reviewModel.checkExistingReview(inv_id, account_id)
    if (hasReviewed) {
        req.flash("notice", "You have already reviewed this vehicle")
        return res.redirect(`/inv/detail/${inv_id}`)
    }

    // Add the review
    const reviewResult = await reviewModel.addReview(
        inv_id,
        account_id,
        review_rating,
        review_text
    )

    if (reviewResult) {
        req.flash("notice", "Review added successfully")
        res.redirect(`/inv/detail/${inv_id}`)
    } else {
        req.flash("notice", "Error adding review")
        res.status(501).redirect(`/inv/detail/${inv_id}`)
    }
}

/* ***************************
 *  Process delete review
 * ************************** */
reviewCont.deleteReview = async function (req, res) {
    const { review_id, inv_id } = req.body
    const account_id = res.locals.accountData.account_id

    // Delete the review
    const deleteResult = await reviewModel.deleteReview(review_id, account_id)

    if (deleteResult) {
        req.flash("notice", "Review deleted successfully")
        res.redirect(`/inv/detail/${inv_id}`)
    } else {
        req.flash("notice", "Error deleting review. You can only delete your own reviews.")
        res.status(501).redirect(`/inv/detail/${inv_id}`)
    }
}

module.exports = reviewCont