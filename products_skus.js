const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Create a new SKU for a product
router.post('/', async (req, res) => {
    try {
        const {
            product_id,
            size_attribute_id,
            color_attribute_id,
            material_attribute_id,
            design_attribute_id,
            sku,
            price,
            quantity,
            created_by
        } = req.body;

        // Basic validation for required fields
        if (!product_id || !sku || price === undefined || quantity === undefined || !created_by) {
            return res.status(400).json({ error: 'Product ID, SKU, price, quantity, and created_by are required fields.' });
        }

        const [skuId] = await db('products_skus').insert({
            product_id,
            size_attribute_id,
            color_attribute_id,
            material_attribute_id,
            design_attribute_id,
            sku,
            price,
            quantity,
            created_by,
        }).returning('id');

        res.status(201).json({ message: 'Product SKU created successfully.', skuId });
    } catch (error) {
        console.error('🔥 Product SKU creation error:', error);
        res.status(500).json({ error: 'Failed to create product SKU.' });
    }
});

// ✅ Get a list of all product SKUs with filtering capabilities
router.get('/', async (req, res) => {
    try {
        const {
            size_attribute_id,
            color_attribute_id,
            material_attribute_id,
            design_attribute_id,
            min_price,
            max_price
        } = req.query;

        let query = db('products_skus').whereNull('deleted_at');

        // Apply filters if they exist in the query string
        if (size_attribute_id) {
            query = query.where({ size_attribute_id });
        }
        if (color_attribute_id) {
            query = query.where({ color_attribute_id });
        }
        if (material_attribute_id) {
            query = query.where({ material_attribute_id });
        }
        if (design_attribute_id) {
            query = query.where({ design_attribute_id });
        }
        if (min_price) {
            query = query.where('price', '>=', min_price);
        }
        if (max_price) {
            query = query.where('price', '<=', max_price);
        }

        const skus = await query.select('*');

        res.status(200).json({ skus });
    } catch (error) {
        console.error('🔥 Fetch SKUs error:', error);
        res.status(500).json({ error: 'Failed to retrieve product SKUs.' });
    }
});

// ✅ Get a specific SKU by ID
router.get('/:skuId', async (req, res) => {
    try {
        const { skuId } = req.params;

        const sku = await db('products_skus').where({ id: skuId }).first();

        if (!sku || sku.deleted_at) {
            return res.status(404).json({ error: 'Product SKU not found.' });
        }

        res.status(200).json({ sku });
    } catch (error) {
        console.error('🔥 Fetch single SKU error:', error);
        res.status(500).json({ error: 'Failed to retrieve product SKU.' });
    }
});

// ✅ Update a specific product SKU
router.put('/:skuId', async (req, res) => {
    try {
        const { skuId } = req.params;
        const {
            product_id,
            size_attribute_id,
            color_attribute_id,
            material_attribute_id,
            design_attribute_id,
            sku,
            price,
            quantity,
            end_date
        } = req.body;

        const updated = await db('products_skus').where({ id: skuId }).update({
            product_id,
            size_attribute_id,
            color_attribute_id,
            material_attribute_id,
            design_attribute_id,
            sku,
            price,
            quantity,
            end_date
        });

        if (updated) {
            res.status(200).json({ message: 'Product SKU updated successfully.' });
        } else {
            res.status(404).json({ error: 'Product SKU not found.' });
        }
    } catch (error) {
        console.error('🔥 Product SKU update error:', error);
        res.status(500).json({ error: 'Failed to update product SKU.' });
    }
});

// ✅ Soft-delete a product SKU
router.delete('/:skuId', async (req, res) => {
    try {
        const { skuId } = req.params;
        const { deleted_by } = req.body;

        if (!deleted_by) {
            return res.status(400).json({ error: 'deleted_by is required.' });
        }

        const updated = await db('products_skus')
            .where({ id: skuId })
            .update({
                deleted_at: db.fn.now(),
                deleted_by,
            });

        if (updated) {
            res.status(200).json({ message: 'Product SKU soft-deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Product SKU not found.' });
        }
    } catch (error) {
        console.error('🔥 Product SKU deletion error:', error);
        res.status(500).json({ error: 'Failed to soft-delete product SKU.' });
    }
});

module.exports = router;
