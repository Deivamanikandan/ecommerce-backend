const express = require('express');
const router = express.Router();
const db = require('../../db');

// ✅ Create a new discount coupon
router.post('/', async (req, res) => {
    try {
        const {
            code,
            description,
            discount_type,
            discount_value,
            usage_limit,
            min_purchase_amount,
            start_date,
            end_date,
            created_by
        } = req.body;

        if (!code || !discount_value) {
            return res.status(400).json({ error: 'Coupon code and discount value are required.' });
        }

        const [couponId] = await db('discount_coupons').insert({
            code,
            description,
            discount_type,
            discount_value,
            usage_limit,
            min_purchase_amount,
            start_date,
            end_date,
            created_by
        }).returning('id');

        res.status(201).json({ message: 'Discount coupon created successfully.', couponId });
    } catch (error) {
        console.error('🔥 Coupon creation error:', error);
        res.status(500).json({ error: 'Failed to create discount coupon.' });
    }
});

// ✅ Get all active discount coupons
router.get('/', async (req, res) => {
    try {
        const coupons = await db('discount_coupons')
            .whereNull('deleted_at')
            .select('*');

        res.status(200).json({ coupons });
    } catch (error) {
        console.error('🔥 Fetch coupons error:', error);
        res.status(500).json({ error: 'Failed to retrieve discount coupons.' });
    }
});

// ✅ Get a single discount coupon by ID
router.get('/:couponId', async (req, res) => {
    try {
        const { couponId } = req.params;

        const coupon = await db('discount_coupons')
            .where({ id: couponId })
            .whereNull('deleted_at')
            .first();

        if (!coupon) {
            return res.status(404).json({ error: 'Discount coupon not found.' });
        }

        res.status(200).json({ coupon });
    } catch (error) {
        console.error('🔥 Fetch coupon error:', error);
        res.status(500).json({ error: 'Failed to retrieve discount coupon.' });
    }
});

// ✅ Update a specific discount coupon
router.put('/:couponId', async (req, res) => {
    try {
        const { couponId } = req.params;
        const {
            description,
            discount_type,
            discount_value,
            usage_limit,
            min_purchase_amount,
            start_date,
            end_date
        } = req.body;

        const updated = await db('discount_coupons')
            .where({ id: couponId })
            .update({
                description,
                discount_type,
                discount_value,
                usage_limit,
                min_purchase_amount,
                start_date,
                end_date,
            });

        if (updated) {
            res.status(200).json({ message: 'Discount coupon updated successfully.' });
        } else {
            res.status(404).json({ error: 'Discount coupon not found.' });
        }
    } catch (error) {
        console.error('🔥 Update coupon error:', error);
        res.status(500).json({ error: 'Failed to update discount coupon.' });
    }
});

// ✅ Soft-delete a discount coupon by ID
router.delete('/:couponId', async (req, res) => {
    try {
        const { couponId } = req.params;
        const { deleted_by } = req.body;

        const deleted = await db('discount_coupons')
            .where({ id: couponId })
            .update({ deleted_at: db.fn.now(), deleted_by });

        if (deleted) {
            res.status(200).json({ message: 'Discount coupon soft-deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Discount coupon not found.' });
        }
    } catch (error) {
        console.error('🔥 Delete coupon error:', error);
        res.status(500).json({ error: 'Failed to soft-delete discount coupon.' });
    }
});

module.exports = router;
