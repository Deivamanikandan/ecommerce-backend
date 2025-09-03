const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Create a new payment detail
router.post('/', async (req, res) => {
    try {
        const { order_id, amount, provider, status } = req.body;

        if (!order_id || !amount || !provider || !status) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const [paymentId] = await db('payment_details').insert({
            order_id,
            amount,
            provider,
            status,
        }).returning('id');

        res.status(201).json({ message: 'Payment detail created successfully.', paymentId });
    } catch (error) {
        console.error('🔥 Payment creation error:', error);
        res.status(500).json({ error: 'Failed to create payment detail.' });
    }
});

// ✅ Get payment details for a specific order
router.get('/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const payments = await db('payment_details')
            .where({ order_id: orderId })
            .select('*');

        res.status(200).json({ payments });
    } catch (error) {
        console.error('🔥 Fetch payment details error:', error);
        res.status(500).json({ error: 'Failed to retrieve payment details.' });
    }
});

// ✅ Get a single payment detail by ID
router.get('/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await db('payment_details').where({ id: paymentId }).first();

        if (!payment) {
            return res.status(404).json({ error: 'Payment detail not found.' });
        }

        res.status(200).json({ payment });
    } catch (error) {
        console.error('🔥 Fetch payment detail error:', error);
        res.status(500).json({ error: 'Failed to retrieve payment detail.' });
    }
});

// ✅ Update a specific payment detail by ID
router.put('/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { amount, provider, status } = req.body;

        const updated = await db('payment_details')
            .where({ id: paymentId })
            .update({
                amount,
                provider,
                status,
                updated_at: db.fn.now(),
            });

        if (updated) {
            res.status(200).json({ message: 'Payment detail updated successfully.' });
        } else {
            res.status(404).json({ error: 'Payment detail not found.' });
        }
    } catch (error) {
        console.error('🔥 Update payment detail error:', error);
        res.status(500).json({ error: 'Failed to update payment detail.' });
    }
});

// ✅ Delete a payment detail by ID
router.delete('/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const deleted = await db('payment_details').where({ id: paymentId }).del();

        if (deleted) {
            res.status(200).json({ message: 'Payment detail deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Payment detail not found.' });
        }
    } catch (error) {
        console.error('🔥 Delete payment detail error:', error);
        res.status(500).json({ error: 'Failed to delete payment detail.' });
    }
});

module.exports = router;
