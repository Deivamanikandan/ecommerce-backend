const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Create a new address for a user
router.post('/', async (req, res) => {
    try {
        const { user_id, title, address_line_1, address_line_2, country, city, postal_code, landmark, phone_number } = req.body;

        if (!user_id || !address_line_1 || !country || !city || !postal_code) {
            return res.status(400).json({ error: 'Required address fields are missing.' });
        }

        const [addressId] = await db('addresses').insert({
            user_id,
            title,
            address_line_1,
            address_line_2,
            country,
            city,
            postal_code,
            landmark,
            phone_number,
        }).returning('id');

        res.status(201).json({ message: 'Address added successfully.', addressId });
    } catch (error) {
        console.error('🔥 Address creation error:', error);
        res.status(500).json({ error: 'Failed to add address.' });
    }
});

// ✅ Get all addresses for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const addresses = await db('addresses').where({ user_id: userId }).select('*');

        res.status(200).json({ addresses });
    } catch (error) {
        console.error('🔥 Get addresses error:', error);
        res.status(500).json({ error: 'Failed to retrieve addresses.' });
    }
});

// ✅ Update a specific address
router.put('/:addressId', async (req, res) => {
    try {
        const { addressId } = req.params;
        const { user_id, title, address_line_1, address_line_2, country, city, postal_code, landmark, phone_number } = req.body;

        const updated = await db('addresses').where({ id: addressId, user_id }).update({
            title,
            address_line_1,
            address_line_2,
            country,
            city,
            postal_code,
            landmark,
            phone_number,
        });

        if (updated) {
            res.status(200).json({ message: 'Address updated successfully.' });
        } else {
            res.status(404).json({ error: 'Address not found or user not authorized.' });
        }
    } catch (error) {
        console.error('🔥 Address update error:', error);
        res.status(500).json({ error: 'Failed to update address.' });
    }
});

// ✅ Delete a specific address
router.delete('/:addressId', async (req, res) => {
    try {
        const { addressId } = req.params;
        const { user_id } = req.body; // Assuming user_id is passed in the body for authorization

        const deleted = await db('addresses').where({ id: addressId, user_id }).del();

        if (deleted) {
            res.status(200).json({ message: 'Address deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Address not found or user not authorized.' });
        }
    } catch (error) {
        console.error('🔥 Address deletion error:', error);
        res.status(500).json({ error: 'Failed to delete address.' });
    }
});

module.exports = router;
