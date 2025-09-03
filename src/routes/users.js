const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

// You will need to install these packages: `npm install crypto-js cookie-parser`

// ---
// SMTP Configuration for free mailer (e.g., Gmail)
// NOTE: Use an "App Password" if you have 2-Step Verification enabled on your Google account.
// You can generate one in your Google Account security settings.
// ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Replace with your Gmail address from .env
        pass: process.env.EMAIL_APP_PASSWORD,    // Replace with your generated App Password from .env
    },
});

// Use cookie-parser middleware
router.use(cookieParser());

// A simple authentication middleware to check for a session token
const authenticate = async (req, res, next) => {
    const token = req.cookies.session_token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const session = await db('sessions')
            .where({ token })
            .andWhere('expires_at', '>', db.fn.now())
            .first();

        if (!session) {
            // If the token is invalid or expired, clear the cookie
            res.clearCookie('session_token');
            return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
        }

        // Find the user and attach it to the request object
        req.user = await db('users').where({ id: session.user_id }).first();
        next();
    } catch (error) {
        console.error('🔥 Authentication middleware error:', error);
        res.status(500).json({ error: 'Server error during authentication' });
    }
};

// Function to generate a random 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// User Registration Route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, avatar, birth_of_date, phone_number } = req.body;

        const existingUser = await db('users').where({ email }).orWhere({ username }).first();
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [userId] = await db('users').insert({
            username,
            email,
            password: hashedPassword,
            first_name,
            last_name,
            avatar,
            birth_of_date,
            phone_number,
        }).returning('id');

        res.status(201).json({ message: 'User registered successfully!', userId });
    } catch (error) {
        console.error('🔥 User registration error:', error);
        res.status(500).json({ error: 'Failed to register user.' });
    }
});

// User Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db('users').where({ email }).first();
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // --- SESSION CREATION & STORAGE ---
        // 1. Generate a secure, random session token
        const sessionToken = crypto.randomBytes(32).toString('hex');

        // 2. Set expiration time (e.g., 7 days)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // 3. Store the session in the database
        await db('sessions').insert({
            user_id: user.id,
            token: sessionToken,
            expires_at: expiresAt,
        }).onConflict('user_id').merge();

        // 4. Send the session token to the client as an HttpOnly cookie
        res.cookie('session_token', sessionToken, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Protects against CSRF attacks
            expires: expiresAt,
        });

        // Send a success message
        res.status(200).json({ message: 'Login successful!', userId: user.id });
    } catch (error) {
        console.error('🔥 User login error:', error);
        res.status(500).json({ error: 'Failed to log in.' });
    }
});

// ---
// OTP and Password Reset Routes
// ---

// ✅ Request OTP for login or password reset
router.post('/request-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await db('users').where({ email }).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db('email_otps').insert({
            email,
            otp,
            expires_at: expiresAt,
        }).onConflict('email').merge();

        // Send the OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address from .env
            to: email, // List of recipients
            subject: 'Your One-Time Password (OTP)', // Subject line
            html: `<p>Your OTP for verification is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('🔥 Email sending error:', error);
                // We don't return an error to the user to avoid providing information to potential attackers
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(200).json({ message: 'OTP sent to email.' });
    } catch (error) {
        console.error('🔥 Request OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP.' });
    }
});

// ✅ Login with OTP
router.post('/login-with-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await db('email_otps')
            .where({ email, otp })
            .andWhere('expires_at', '>', db.fn.now())
            .first();

        if (!otpRecord) {
            return res.status(401).json({ error: 'Invalid or expired OTP.' });
        }

        const user = await db('users').where({ email }).first();

        await db('email_otps').where({ email }).del();

        // --- SESSION CREATION & STORAGE (for OTP login) ---
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db('sessions').insert({
            user_id: user.id,
            token: sessionToken,
            expires_at: expiresAt,
        }).onConflict('user_id').merge();

        res.cookie('session_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: expiresAt,
        });

        res.status(200).json({ message: 'Login successful!', userId: user.id });
    } catch (error) {
        console.error('🔥 Login with OTP error:', error);
        res.status(500).json({ error: 'Failed to log in with OTP.' });
    }
});

// ✅ Reset password with OTP
router.post('/reset-password-with-otp', async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;

        const otpRecord = await db('email_otps')
            .where({ email, otp })
            .andWhere('expires_at', '>', db.fn.now())
            .first();

        if (!otpRecord) {
            return res.status(401).json({ error: 'Invalid or expired OTP.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        await db('users').where({ email }).update({ password: hashedPassword });

        await db('email_otps').where({ email }).del();

        res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        console.error('🔥 Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password.' });
    }
});

// ---
// Example of a protected route
// ---
router.get('/profile', authenticate, async (req, res) => {
    // The `authenticate` middleware has already verified the user.
    // The user's information is available at req.user
    res.status(200).json({
        message: 'Welcome to your secure profile!',
        user: req.user
    });
});


module.exports = router;
