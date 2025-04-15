const pool = require("../database/")

/* ***************************
 *  Get all reviews for a specific vehicle
 * ************************** */
async function getReviewsByVehicleId(inv_id) {
    try {
        const data = await pool.query(
            `SELECT r.*, a.account_firstname, a.account_lastname
       FROM public.review AS r 
       JOIN public.account AS a 
       ON r.account_id = a.account_id 
       WHERE r.inv_id = $1
       ORDER BY r.review_date DESC`,
            [inv_id]
        )
        return data.rows
    } catch (error) {
        console.error("getReviewsByVehicleId error: " + error)
        return []
    }
}

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(inv_id, account_id, review_rating, review_text) {
    try {
        const sql = `
      INSERT INTO public.review 
      (inv_id, account_id, review_rating, review_text) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`

        const data = await pool.query(sql, [
            inv_id,
            account_id,
            review_rating,
            review_text
        ])

        return data.rows[0]
    } catch (error) {
        console.error("addReview error: " + error)
        return null
    }
}

/* ***************************
 *  Check if user already reviewed this vehicle
 * ************************** */
async function checkExistingReview(inv_id, account_id) {
    try {
        const sql = "SELECT * FROM public.review WHERE inv_id = $1 AND account_id = $2"
        const data = await pool.query(sql, [inv_id, account_id])
        return data.rowCount > 0
    } catch (error) {
        console.error("checkExistingReview error: " + error)
        return false
    }
}

/* ***************************
 *  Get review stats for a vehicle
 * ************************** */
async function getReviewStats(inv_id) {
    try {
        const sql = `
      SELECT 
        COUNT(*) as review_count,
        ROUND(AVG(review_rating), 1) as average_rating
      FROM public.review
      WHERE inv_id = $1`

        const data = await pool.query(sql, [inv_id])
        return data.rows[0]
    } catch (error) {
        console.error("getReviewStats error: " + error)
        return { review_count: 0, average_rating: 0 }
    }
}

/* ***************************
 *  Delete a review
 * ************************** */
async function deleteReview(review_id, account_id) {
    try {
        // Only allow users to delete their own reviews
        const sql = "DELETE FROM public.review WHERE review_id = $1 AND account_id = $2 RETURNING *"
        const data = await pool.query(sql, [review_id, account_id])
        return data.rows[0]
    } catch (error) {
        console.error("deleteReview error: " + error)
        return null
    }
}

module.exports = {
    getReviewsByVehicleId,
    addReview,
    checkExistingReview,
    getReviewStats,
    deleteReview
}