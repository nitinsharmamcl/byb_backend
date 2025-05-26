// const express = require('express');
// const Razorpay = require('razorpay');
// const router = express.Router();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// router.post('/', async (req, res) => {
//   const data = req.body;
//   try {
//     const order = await razorpay.orders.create({
//       amount: data.amount,
//       currency: 'INR',
//       receipt: 'receipt_' + Math.random().toString(36).substring(7),
//     });
//     return res.status(200).json({ order_id: order.id, receipt: order.receipt });
//   } catch (err) {
//     return res.status(500).json({ error: 'eror  while creating order' });
//   }
// });

// module.exports = router; 