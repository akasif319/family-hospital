const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const adminAuth = require('../middleware/authMiddleware');
const { exceedsLength } = require('../utils/sanitize');

const NAME_MAX = 100;
const EMAIL_MAX = 254;
const REVIEW_MAX = 250;
const DEPT_MAX = 100;

// POST /api/reviews - Submit review (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, rating, department, review } = req.body;

        if (!name || !email || !rating || !review) {
            return res.status(400).json({ message: 'Name, email, rating, and review are required' });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        if (exceedsLength(name, NAME_MAX)) return res.status(400).json({ message: `Name must be ${NAME_MAX} characters or fewer` });
        if (exceedsLength(email, EMAIL_MAX)) return res.status(400).json({ message: 'Invalid email address' });
        if (exceedsLength(review, REVIEW_MAX)) return res.status(400).json({ message: `Review must be ${REVIEW_MAX} characters or fewer` });
        if (department && exceedsLength(department, DEPT_MAX)) return res.status(400).json({ message: `Department name too long` });

        if (name.length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters' });
        if (review.length < 10) return res.status(400).json({ message: 'Review must be at least 10 characters' });

        const newReview = new Review({ name, email, rating, department: department || '', review });
        await newReview.save();

        res.status(201).json({ message: 'Review submitted successfully. It will appear after approval.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit review', error: error.message });
    }
});

// GET /api/reviews?approved=true - Public: get approved reviews only
router.get('/public', async (req, res) => {
    try {
        const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(function(r) { counts[r.rating]++; });
        res.json({ reviews, avgRating, totalReviews: reviews.length, counts });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
});

// GET /api/reviews - Admin: get all reviews
router.get('/', adminAuth, async (req, res) => {
    try {
        var filter = {};
        if (req.query.status === 'approved') filter.isApproved = true;
        if (req.query.status === 'pending') filter.isApproved = false;

        const reviews = await Review.find(filter).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
});

// PUT /api/reviews/:id/status - Admin: toggle approve/unapprove
router.put('/:id/status', adminAuth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        review.isApproved = !review.isApproved;
        await review.save();

        res.json({ message: review.isApproved ? 'Review approved' : 'Review hidden', review });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update review', error: error.message });
    }
});

// DELETE /api/reviews/:id - Admin: delete review
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete review', error: error.message });
    }
});

module.exports = router;