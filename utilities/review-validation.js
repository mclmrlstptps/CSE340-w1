const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
*  Review Data Validation Rules
* ********************************* */
validate.reviewRules = () => {
    return [
        // review_rating is required and must be between 1-5
        body("review_rating")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Rating is required")
            .isInt({ min: 1, max: 5 })
            .withMessage("Rating must be between 1 and 5"),

        // review_text is required and must be string with at least 10 characters
        body("review_text")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Review text is required")
            .isLength({ min: 10 })
            .withMessage("Review must be at least 10 characters long"),

        // inv_id is required and must be a number
        body("inv_id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Vehicle ID is required")
            .isNumeric()
            .withMessage("Invalid vehicle ID")
    ]
}

/* ******************************
 * Check review data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
    const { inv_id, review_rating, review_text } = req.body
    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        req.flash("notice", errors.array().map(err => err.msg).join(', '))
        return res.redirect(`/inv/detail/${inv_id}`)
    }
    next()
}

module.exports = validate