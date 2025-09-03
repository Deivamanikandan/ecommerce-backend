const express = require('express');
const router = express.Router();
const db = require('../../db');

// ✅ Create a new product attribute
router.post('/', async (req, res) => {
    try {
        const { type, value, created_by } = req.body;

        if (!type || !value || !created_by) {
            return res.status(400).json({ error: 'Type, value, and created_by are required fields.' });
        }

        const [attributeId] = await db('product_attributes').insert({
            type,
            value,
            created_by,
        }).returning('id');

        res.status(201).json({ message: 'Product attribute created successfully.', attributeId });
    } catch (error) {
        console.error('🔥 Product attribute creation error:', error);
        res.status(500).json({ error: 'Failed to create product attribute.' });
    }
});

// ✅ Get a list of all product attributes
router.get('/', async (req, res) => {
    try {
        const attributes = await db('product_attributes')
            .whereNull('deleted_at')
            .select('*');

        res.status(200).json({ attributes });
    } catch (error) {
        console.error('🔥 Fetch attributes error:', error);
        res.status(500).json({ error: 'Failed to retrieve product attributes.' });
    }
});

// ✅ Soft-delete a product attribute
router.delete('/:attributeId', async (req, res) => {
    try {
        const { attributeId } = req.params;
        const { deleted_by } = req.body;

        if (!deleted_by) {
            return res.status(400).json({ error: 'deleted_by is required.' });
        }

        const updated = await db('product_attributes')
            .where({ id: attributeId })
            .update({
                deleted_at: db.fn.now(),
                deleted_by,
            });

        if (updated) {
            res.status(200).json({ message: 'Product attribute soft-deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Product attribute not found.' });
        }
    } catch (error) {
        console.error('🔥 Product attribute deletion error:', error);
        res.status(500).json({ error: 'Failed to soft-delete product attribute.' });
    }
});

module.exports = router;
