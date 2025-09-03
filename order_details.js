const express = require('express');
const router = express('router');
const db = require('../db');

// ✅ Create a new order detail
router.post('/', async (req, res) => {
    try {
        const { user_id, payment_id, order_value, discount, payment_amount } = req.body;

        if (!user_id || !order_value || !payment_amount) {
            return res.status(400).json({ error: 'User ID, order value, and payment amount are required.' });
        }

        const [orderId] = await db('order_details').insert({
            user_id,
            payment_id,
            order_value,
            discount,
            payment_amount,
        }).returning('id');

        res.status(201).json({ message: 'Order detail created successfully.', orderId });
    } catch (error) {
        console.error('🔥 Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order detail.' });
    }
});

// ✅ Get all order details for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const orders = await db('order_details')
            .where({ user_id: userId })
            .select('*');

        res.status(200).json({ orders });
    } catch (error) {
        console.error('🔥 Fetch user orders error:', error);
        res.status(500).json({ error: 'Failed to retrieve user orders.' });
    }
});

// ✅ Get a single order detail by ID
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await db('order_details').where({ id: orderId }).first();

        if (!order) {
            return res.status(404).json({ error: 'Order detail not found.' });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('🔥 Fetch order detail error:', error);
        res.status(500).json({ error: 'Failed to retrieve order detail.' });
    }
});

// ✅ Update a specific order detail by ID
router.put('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { order_value, discount, payment_amount } = req.body;

        const updated = await db('order_details')
            .where({ id: orderId })
            .update({
                order_value,
                discount,
                payment_amount,
                updated_at: db.fn.now(),
            });

        if (updated) {
            res.status(200).json({ message: 'Order detail updated successfully.' });
        } else {
            res.status(404).json({ error: 'Order detail not found.' });
        }
    } catch (error) {
        console.error('🔥 Update order detail error:', error);
        res.status(500).json({ error: 'Failed to update order detail.' });
    }
});

// ✅ Delete an order detail by ID
router.delete('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const deleted = await db('order_details').where({ id: orderId }).del();

        if (deleted) {
            res.status(200).json({ message: 'Order detail deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Order detail not found.' });
        }
    } catch (error) {
        console.error('🔥 Delete order detail error:', error);
        res.status(500).json({ error: 'Failed to delete order detail.' });
    }
});

module.exports = router;
