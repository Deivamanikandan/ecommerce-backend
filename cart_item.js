const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Add an item to the cart
router.post('/', async (req, res) => {
    try {
        const { cart_id, product_id, products_sku_id, quantity } = req.body;

        if (!cart_id || !product_id || !products_sku_id || !quantity) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const [cartItemId] = await db('cart_item').insert({
            cart_id,
            product_id,
            products_sku_id,
            quantity,
        }).returning('id');

        res.status(201).json({ message: 'Item added to cart successfully.', cartItemId });
    } catch (error) {
        console.error('🔥 Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add item to cart.' });
    }
});

// ✅ Get all items in a specific cart
router.get('/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;

        const cartItems = await db('cart_item')
            .where({ cart_id: cartId })
            .whereNull('deleted_at')
            .select('*');

        res.status(200).json({ cartItems });
    } catch (error) {
        console.error('🔥 Fetch cart items error:', error);
        res.status(500).json({ error: 'Failed to retrieve cart items.' });
    }
});

// ✅ Update the quantity of a specific cart item
router.put('/:cartItemId', async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const { quantity } = req.body;

        if (!quantity) {
            return res.status(400).json({ error: 'Quantity is required for update.' });
        }

        const updated = await db('cart_item')
            .where({ id: cartItemId })
            .update({
                quantity,
                updated_at: db.fn.now()
            });

        if (updated) {
            res.status(200).json({ message: 'Cart item updated successfully.' });
        } else {
            res.status(404).json({ error: 'Cart item not found.' });
        }
    } catch (error) {
        console.error('🔥 Update cart item error:', error);
        res.status(500).json({ error: 'Failed to update cart item.' });
    }
});

// ✅ Soft-delete a cart item
router.delete('/:cartItemId', async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const { deleted_by } = req.body;

        const deleted = await db('cart_item')
            .where({ id: cartItemId })
            .update({
                deleted_at: db.fn.now(),
                deleted_by,
            });

        if (deleted) {
            res.status(200).json({ message: 'Cart item soft-deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Cart item not found.' });
        }
    } catch (error) {
        console.error('🔥 Delete cart item error:', error);
        res.status(500).json({ error: 'Failed to soft-delete cart item.' });
    }
});

module.exports = router;
