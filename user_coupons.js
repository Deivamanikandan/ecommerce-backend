const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Assign a coupon to a user
router.post('/assign', async (req, res) => {
    try {
        const { user_id, coupon_id, created_by } = req.body;

        if (!user_id || !coupon_id) {
            return res.status(400).json({ error: 'User ID and Coupon ID are required.' });
        }

        const [userCouponId] = await db('user_coupons').insert({
            user_id,
            coupon_id,
            created_by,
        }).returning('id');

        res.status(201).json({ message: 'Coupon assigned to user successfully.', userCouponId });
    } catch (error) {
        console.error('🔥 Assign coupon error:', error);
        res.status(500).json({ error: 'Failed to assign coupon to user.' });
    }
});

// ✅ Get all un-used coupons for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const userCoupons = await db('user_coupons')
            .where({ user_id: userId })
            .whereNull('used_at')
            .whereNull('deleted_at')
            .select('*');

        res.status(200).json({ userCoupons });
    } catch (error) {
        console.error('🔥 Fetch user coupons error:', error);
        res.status(500).json({ error: 'Failed to retrieve user coupons.' });
    }
});

// ✅ Mark a user's coupon as used
router.put('/use/:userCouponId', async (req, res) => {
    try {
        const { userCouponId } = req.params;
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({ error: 'Order ID is required to use a coupon.' });
        }

        const updated = await db('user_coupons')
            .where({ id: userCouponId })
            .update({
                order_id,
                used_at: db.fn.now(),
            });

        if (updated) {
            res.status(200).json({ message: 'Coupon used successfully.' });
        } else {
            res.status(404).json({ error: 'User coupon not found.' });
        }
    } catch (error) {
        console.error('🔥 Use coupon error:', error);
        res.status(500).json({ error: 'Failed to use coupon.' });
    }
});

// ✅ Soft-delete a user's coupon
router.delete('/:userCouponId', async (req, res) => {
    try {
        const { userCouponId } = req.params;
        const { deleted_by } = req.body;

        const deleted = await db('user_coupons')
            .where({ id: userCouponId })
            .update({
                deleted_at: db.fn.now(),
                deleted_by,
            });

        if (deleted) {
            res.status(200).json({ message: 'User coupon soft-deleted successfully.' });
        } else {
            res.status(404).json({ error: 'User coupon not found.' });
        }
    } catch (error) {
        console.error('🔥 Soft-delete coupon error:', error);
        res.status(500).json({ error: 'Failed to soft-delete user coupon.' });
    }
});

module.exports = router;
