const express = require('express');
const router = express.Router();
const db = require('../../db');

// ✅ Create a new product
router.post('/', async (req, res) => {
    try {
        const {
            name,
            description,
            summary,
            cover,
            category_id,
            subcategory_id,
            gender,
            created_by
        } = req.body;

        // Basic validation
        if (!name || !category_id || !created_by) {
            return res.status(400).json({ error: 'Name, category_id, and created_by are required fields.' });
        }

        const [productId] = await db('products').insert({
            name,
            description,
            summary,
            cover,
            category_id,
            subcategory_id,
            gender,
            created_by
        }).returning('id');

        res.status(201).json({ message: 'Product created successfully.', productId });
    } catch (error) {
        console.error('🔥 Product creation error:', error);
        res.status(500).json({ error: 'Failed to create product.' });
    }
});

// ✅ Get a list of all products with filtering capabilities
router.get('/', async (req, res) => {
    try {
        const { gender, category_id, subcategory_id, name } = req.query;

        let query = db('products').whereNull('deleted_at');

        // Apply filters if they exist in the query string
        if (gender) {
            query = query.where({ gender });
        }

        if (category_id) {
            query = query.where({ category_id });
        }

        if (subcategory_id) {
            query = query.where({ subcategory_id });
        }

        if (name) {
            // Use 'ilike' for case-insensitive partial matching (PostgreSQL specific)
            query = query.where('name', 'ilike', `%${name}%`);
        }

        const products = await query.select('*');

        res.status(200).json({ products });
    } catch (error) {
        console.error('🔥 Fetch products error:', error);
        res.status(500).json({ error: 'Failed to retrieve products.' });
    }
});

// ✅ Get a specific product by ID
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await db('products').where({ id: productId }).first();

        if (!product || product.deleted_at) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.status(200).json({ product });
    } catch (error) {
        console.error('🔥 Fetch single product error:', error);
        res.status(500).json({ error: 'Failed to retrieve product.' });
    }
});

// ✅ Update a specific product
router.put('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            name,
            description,
            summary,
            cover,
            category_id,
            subcategory_id,
            gender
        } = req.body;

        const updated = await db('products').where({ id: productId }).update({
            name,
            description,
            summary,
            cover,
            category_id,
            subcategory_id,
            gender
        });

        if (updated) {
            res.status(200).json({ message: 'Product updated successfully.' });
        } else {
            res.status(404).json({ error: 'Product not found.' });
        }
    } catch (error) {
        console.error('🔥 Product update error:', error);
        res.status(500).json({ error: 'Failed to update product.' });
    }
});

// ✅ Soft-delete a product
router.delete('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { deleted_by } = req.body;

        if (!deleted_by) {
            return res.status(400).json({ error: 'deleted_by is required.' });
        }

        const updated = await db('products')
            .where({ id: productId })
            .update({
                deleted_at: db.fn.now(),
                deleted_by,
            });

        if (updated) {
            res.status(200).json({ message: 'Product soft-deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Product not found.' });
        }
    } catch (error) {
        console.error('🔥 Product deletion error:', error);
        res.status(500).json({ error: 'Failed to soft-delete product.' });
    }
});

module.exports = router;
