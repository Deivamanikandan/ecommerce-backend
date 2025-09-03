const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Create a new category
router.post('/', async (req, res) => {
    try {
        const { name, description, created_by } = req.body;

        if (!name || !created_by) {
            return res.status(400).json({ error: 'Name and created_by are required.' });
        }

        const [categoryId] = await db('categories').insert({
            name,
            description,
            created_by,
        }).returning('id');

        res.status(201).json({ message: 'Category created successfully.', categoryId });
    } catch (error) {
        console.error('🔥 Category creation error:', error);
        res.status(500).json({ error: 'Failed to create category.' });
    }
});

// ✅ Create a new sub-category for a given category
router.post('/:parentId/sub-category', async (req, res) => {
    try {
        const { parentId } = req.params;
        const { name, description, created_by, gender } = req.body;

        if (!name || !created_by) {
            return res.status(400).json({ error: 'Name and created_by are required.' });
        }

        const existingCategory = await db('categories').where({ id: parentId }).first();
        if (!existingCategory) {
            return res.status(404).json({ error: 'Parent category not found.' });
        }

        const [subCategoryId] = await db('sub_categories').insert({
            name,
            description,
            parent_id: parentId,
            created_by,
            gender
        }).returning('id');

        res.status(201).json({ message: 'Sub-category created successfully.', subCategoryId });
    } catch (error) {
        console.error('🔥 Sub-category creation error:', error);
        res.status(500).json({ error: 'Failed to create sub-category.' });
    }
});

// ✅ Soft delete a category (and its sub-categories)
router.delete('/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { deleted_by } = req.body;

        if (!deleted_by) {
            return res.status(400).json({ error: 'deleted_by is required.' });
        }

        const category = await db('categories').where({ id: categoryId }).first();
        if (!category) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        // Soft delete the main category
        await db('categories').where({ id: categoryId }).update({
            deleted_by,
            deleted_at: db.fn.now(),
        });

        // Soft delete all associated sub-categories
        await db('sub_categories').where({ parent_id: categoryId }).update({
            deleted_by,
            deleted_at: db.fn.now(),
        });

        res.status(200).json({ message: 'Category and its sub-categories soft-deleted successfully.' });
    } catch (error) {
        console.error('🔥 Category soft-delete error:', error);
        res.status(500).json({ error: 'Failed to soft-delete category.' });
    }
});

module.exports = router;
