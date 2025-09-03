const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Add an item to an order
router.post('/', async (req, res) => {
    try {
        const { order_id, product_id, products_sku_id, quantity, product_price, total_amount } = req.body;

        if (!order_id || !product_id || !products_sku_id || !quantity || !product_price || !total_amount) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const [orderItemId] = await db('order_item').insert({
            order_id,
            product_id,
            products_sku_id,
            quantity,
            product_price,
            total_amount,
        }).returning('id');

        res.status(201).json({ message: 'Item added to order successfully.', orderItemId });
    } catch (error) {
        console.error('🔥 Add to order error:', error);
        res.status(500).json({ error: 'Failed to add item to order.' });
    }
});

// ✅ Get all items for a specific order
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const orderItems = await db('order_item')
            .where({ order_id: orderId })
            .select('*');

        res.status(200).json({ orderItems });
    } catch (error) {
        console.error('🔥 Fetch order items error:', error);
        res.status(500).json({ error: 'Failed to retrieve order items.' });
    }
});

// ✅ Update the quantity of a specific order item
router.put('/:orderItemId', async (req, res) => {
    try {
        const { orderItemId } = req.params;
        const { quantity, product_price } = req.body;

        if (!quantity || !product_price) {
            return res.status(400).json({ error: 'Quantity and product price are required for update.' });
        }

        const total_amount = quantity * product_price;

        const updated = await db('order_item')
            .where({ id: orderItemId })
            .update({
                quantity,
                total_amount,
                updated_at: db.fn.now()
            });

        if (updated) {
            res.status(200).json({ message: 'Order item updated successfully.' });
        } else {
            res.status(404).json({ error: 'Order item not found.' });
        }
    } catch (error) {
        console.error('🔥 Update order item error:', error);
        res.status(500).json({ error: 'Failed to update order item.' });
    }
});

// ✅ Delete an item from an order
router.delete('/:orderItemId', async (req, res) => {
    try {
        const { orderItemId } = req.params;

        const deleted = await db('order_item').where({ id: orderItemId }).del();

        if (deleted) {
            res.status(200).json({ message: 'Order item deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Order item not found.' });
        }
    } catch (error) {
        console.error('🔥 Delete order item error:', error);
        res.status(500).json({ error: 'Failed to delete order item.' });
    }
});

module.exports = router;
