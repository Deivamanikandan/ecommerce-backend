const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Create a new product image record
router.post('/', async (req, res) => {
    try {
        const {
            product_id,
            color_attribute_id,
            design_attribute_id,
            image_url,
            created_by
        } = req.body;

        if (!product_id || !image_url || !created_by) {
            return res.status(400).json({ error: 'Product ID, image URL, and created_by are required fields.' });
        }

        const [imageId] = await db('product_images').insert({
            product_id,
            color_attribute_id,
            design_attribute_id,
            image_url,
            created_by,
        }).returning('id');

        res.status(201).json({ message: 'Product image record created successfully.', imageId });
    } catch (error) {
        console.error('🔥 Product image creation error:', error);
        res.status(500).json({ error: 'Failed to create product image record.' });
    }
});

// ✅ Get a list of all product images with optional filtering
router.get('/', async (req, res) => {
    try {
        const {
            product_id,
            color_attribute_id,
            design_attribute_id
        } = req.query;

        let query = db('product_images').whereNull('deleted_at');

        // Apply filters if they exist in the query string
        if (product_id) {
            query = query.where({ product_id });
        }
        if (color_attribute_id) {
            query = query.where({ color_attribute_id });
        }
        if (design_attribute_id) {
            query = query.where({ design_attribute_id });
        }

        const images = await query.select('*');

        res.status(200).json({ images });
    } catch (error) {
        console.error('🔥 Fetch images error:', error);
        res.status(500).json({ error: 'Failed to retrieve product images.' });
    }
});

// ✅ Get a specific product image by ID
router.get('/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;

        const image = await db('product_images').where({ id: imageId }).first();

        if (!image || image.deleted_at) {
            return res.status(404).json({ error: 'Product image not found.' });
        }

        res.status(200).json({ image });
    } catch (error) {
        console.error('🔥 Fetch single image error:', error);
        res.status(500).json({ error: 'Failed to retrieve product image.' });
    }
});

// ✅ Update a specific product image record
router.put('/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const {
            product_id,
            color_attribute_id,
            design_attribute_id,
            image_url,
            end_date
        } = req.body;

        const updated = await db('product_images').where({ id: imageId }).update({
            product_id,
            color_attribute_id,
            design_attribute_id,
            image_url,
            end_date
        });

        if (updated) {
            res.status(200).json({ message: 'Product image record updated successfully.' });
        } else {
            res.status(404).json({ error: 'Product image record not found.' });
        }
    } catch (error) {
        console.error('🔥 Product image update error:', error);
        res.status(500).json({ error: 'Failed to update product image record.' });
    }
});

// ✅ Soft-delete a product image record
router.delete('/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const { deleted_by } = req.body;

        if (!deleted_by) {
            return res.status(400).json({ error: 'deleted_by is required.' });
        }

        const updated = await db('product_images')
            .where({ id: imageId })
            .update({
                deleted_at: db.fn.now(),
                deleted_by,
            });

        if (updated) {
            res.status(200).json({ message: 'Product image record soft-deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Product image record not found.' });
        }
    } catch (error) {
        console.error('🔥 Product image deletion error:', error);
        res.status(500).json({ error: 'Failed to soft-delete product image record.' });
    }
});

module.exports = router;
