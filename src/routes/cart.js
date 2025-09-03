const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Create a new cart for a user
router.post('/', async (req, res) => {
    try {
        const { user_id } = req.body;

        // Check if a cart already exists for the user
        const existingCart = await db('cart').where({ user_id }).first();
        if (existingCart) {
            return res.status(409).json({ error: 'A cart already exists for this user.' });
        }

        const [cartId] = await db('cart').insert({ user_id }).returning('id');

        res.status(201).json({ message: 'Cart created successfully.', cartId });
    } catch (error) {
        console.error('🔥 Cart creation error:', error);
        res.status(500).json({ error: 'Failed to create cart.' });
    }
});

// ✅ Get a user's cart
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await db('cart').where({ user_id: userId }).first();
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found for this user.' });
        }

        res.status(200).json({ cart });
    } catch (error) {
        console.error('🔥 Fetch cart error:', error);
        res.status(500).json({ error: 'Failed to retrieve cart.' });
    }
});

// ✅ Update the total in a user's cart
router.put('/:cartId/update-total', async (req, res) => {
    try {
        const { cartId } = req.params;
        const { total } = req.body;

        const updated = await db('cart').where({ id: cartId }).update({
            total,
            updated_at: db.fn.now()
        });

        if (updated) {
            res.status(200).json({ message: 'Cart total updated successfully.' });
        } else {
            res.status(404).json({ error: 'Cart not found.' });
        }
    } catch (error) {
        console.error('🔥 Cart total update error:', error);
        res.status(500).json({ error: 'Failed to update cart total.' });
    }
});

// ✅ Delete a cart
router.delete('/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;

        const deleted = await db('cart').where({ id: cartId }).del();

        if (deleted) {
            res.status(200).json({ message: 'Cart deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Cart not found.' });
        }
    } catch (error) {
        console.error('🔥 Cart deletion error:', error);
        res.status(500).json({ error: 'Failed to delete cart.' });
    }
});

module.exports = router;
