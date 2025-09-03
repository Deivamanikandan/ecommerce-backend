const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Add a product to a user's wishlist
router.post('/', async (req, res) => {
    try {
        const { product_id, user_id } = req.body;

        // Basic validation for required fields
        if (!product_id || !user_id) {
            return res.status(400).json({ error: 'Product ID and user ID are required.' });
        }

        // Check if the item is already in the wishlist
        const existingItem = await db('wishlist')
            .where({ product_id, user_id })
            .whereNull('deleted_at')
            .first();

        if (existingItem) {
            return res.status(409).json({ error: 'Product is already in the wishlist.' });
        }

        const [wishlistId] = await db('wishlist').insert({
            product_id,
            user_id,
        }).returning('id');

        res.status(201).json({ message: 'Product added to wishlist successfully.', wishlistId });
    } catch (error) {
        console.error('🔥 Add to wishlist error:', error);
        res.status(500).json({ error: 'Failed to add product to wishlist.' });
    }
});

// ✅ Get a user's wishlist
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const wishlistItems = await db('wishlist')
            .where({ user_id: userId })
            .whereNull('deleted_at')
            .select('*');

        res.status(200).json({ wishlistItems });
    } catch (error) {
        console.error('🔥 Fetch wishlist error:', error);
        res.status(500).json({ error: 'Failed to retrieve wishlist items.' });
    }
});

// ✅ Soft-delete a wishlist item
router.delete('/:wishlistId', async (req, res) => {
    try {
        const { wishlistId } = req.params;
        const { deleted_by } = req.body;

        if (!deleted_by) {
            return res.status(400).json({ error: 'deleted_by is required for deletion.' });
        }

        const updated = await db('wishlist')
            .where({ id: wishlistId })
            .update({
                deleted_at: db.fn.now(),
                deleted_by,
            });

        if (updated) {
            res.status(200).json({ message: 'Wishlist item soft-deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Wishlist item not found.' });
        }
    } catch (error) {
        console.error('🔥 Wishlist item deletion error:', error);
        res.status(500).json({ error: 'Failed to soft-delete wishlist item.' });
    }
});

module.exports = router;
