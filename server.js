require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require("cors");

// outes from your reference file
const productRoutes = require('./routes/admin/products');
const cartRoutes = require('./routes/cart');
const UserRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const addressesRoutes = require('./routes/addresses');
const productAttributesRoutes = require('./routes/admin/product_attributes');
const adminProductsRoutes = require('./routes/admin/products');
const productSkusRoutes = require('./routes/products_skus.js');
const productImagesRoutes = require('./routes/product_images');
const wishlistRoutes = require('./routes/wishlist');
const cartItemRoutes = require('./routes/cart_item');
const orderDetailsRoutes = require('./routes/order_details');
const orderItemRoutes = require('./routes/order_item');
const paymentDetailsRoutes = require('./routes/payment_details');
const discountCouponsRoutes = require('./routes/admin/discount_coupons');
const userCouponsRoutes = require('./routes/user_coupons');

// Allow frontend to access the backend
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  API routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/admin/product-attributes', productAttributesRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/products-skus', productSkusRoutes);
app.use('/api/product-images', productImagesRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart-item', cartItemRoutes);
app.use('/api/order-details', orderDetailsRoutes);
app.use('/api/order-item', orderItemRoutes);
app.use('/api/payment-details', paymentDetailsRoutes);
app.use('/api/admin/discount-coupons', discountCouponsRoutes);
app.use('/api/user-coupons', userCouponsRoutes);

app.get('/', (req, res) => res.json({ ok: true, msg: 'Ecommerce Backend Running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
