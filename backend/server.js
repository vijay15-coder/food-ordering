require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require('path');
const { Server } = require("socket.io");

const Order = require("./models/Order");
const Menu = require("./models/Menu");
const Payment = require("./models/Payment");
const Counter = require("./models/Counter");
const ScratchCard = require("./models/ScratchCard");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { authenticate, authorize } = require('./middleware/auth');

const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO connection handling for order tracking
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle joining order tracking room
  socket.on('joinOrderTracking', (orderNumber) => {
    socket.join(`order-${orderNumber}`);
    console.log(`User ${socket.id} joined tracking room for order ${orderNumber}`);
  });
  
  // Handle joining public order tracking room
  socket.on('joinPublicOrderTracking', () => {
    socket.join('public-orders');
    console.log(`User ${socket.id} joined public order tracking room`);
  });
  
  // Handle leaving order tracking room
  socket.on('leaveOrderTracking', (orderNumber) => {
    socket.leave(`order-${orderNumber}`);
    console.log(`User ${socket.id} left tracking room for order ${orderNumber}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'customer' });
    await user.save();
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/orders", authenticate, async (req, res) => {
  try {
    console.log('Creating order for user:', req.user._id);
    console.log('Order data:', req.body);
    const counter = await Counter.findOneAndUpdate(
      { _id: 'orderNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    req.body.orderNumber = counter.seq;
    req.body.userId = req.user._id;
    const order = new Order(req.body);
    console.log('Order to save:', order);
    await order.save();
    const payment = new Payment({ orderId: order._id, amount: order.total, method: order.paymentMethod });
    await payment.save();
    order.paymentId = payment._id;
    await order.save();
    // Try simple populate first
    await order.populate('userId', 'name email');
    await order.populate('items.menuId', 'name price');
    io.emit('newOrder', order); // Emit to all connected clients
    console.log('Order created and populated successfully');
    res.status(201).json(order);
  } catch (error) {
    console.log('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/orders", authenticate, authorize(['admin']), async (req, res) => {
  try {
    console.log('GET /api/orders - User ID:', req.user._id, 'Role:', req.user.role);
    console.log('Fetching orders...');
    const orders = await Order.find().populate('userId', 'name email').populate('items.menuId', 'name price');
    console.log('Orders found:', orders.length);
    // Sort orders: pending first, then by status priority, then by createdAt ascending
    const statusOrder = { pending: 1, approved: 2, preparing: 3, ready: 4, completed: 5 };
    orders.sort((a, b) => {
      const aPriority = statusOrder[a.status] || 6;
      const bPriority = statusOrder[b.status] || 6;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    res.json(orders);
  } catch (error) {
    console.log('Error fetching orders:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Public order tracking endpoint (no authentication required)
app.get("/api/orders/track/:orderNumber", async (req, res) => {
  try {
    const orderNumber = parseInt(req.params.orderNumber);
    if (isNaN(orderNumber)) {
      return res.status(400).json({ message: 'Invalid order number' });
    }
    
    const order = await Order.findOne({ orderNumber })
      .populate('items.menuId', 'name price')
      .populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Return only necessary information for tracking
    const orderInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        name: item.menuId?.name || 'Unknown Item',
        quantity: item.quantity,
        price: item.menuId?.price || 0
      })),
      estimatedTime: getEstimatedTime(order.status)
    };
    
    res.json(orderInfo);
  } catch (error) {
    console.log('Error tracking order:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Public endpoint to get all approved/completed orders (no authentication required)
app.get("/api/orders/public", async (req, res) => {
  try {
    console.log('Fetching public orders...');
    const orders = await Order.find({ 
      status: { $in: ['approved', 'completed'] } 
    })
    .populate('userId', 'name email')
    .populate('items.menuId', 'name price')
    .sort({ createdAt: -1 });
    
    console.log('Public orders found:', orders.length);
    
    // Format orders for public display
    const publicOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      customerName: order.userId?.name || 'Anonymous',
      items: order.items.map(item => ({
        name: item.menuId?.name || 'Unknown Item',
        quantity: item.quantity,
        price: item.menuId?.price || 0
      })),
      estimatedTime: getEstimatedTime(order.status),
      isCompleted: order.status === 'completed'
    }));
    
    res.json(publicOrders);
  } catch (error) {
    console.log('Error fetching public orders:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Helper function to estimate preparation time based on status
function getEstimatedTime(status) {
  const times = {
    'pending': '5-10 minutes',
    'approved': '15-20 minutes',
    'preparing': '10-15 minutes',
    'ready': 'Ready for pickup',
    'completed': 'Completed'
  };
  return times[status] || 'Calculating...';
}

app.get("/api/orders/user", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate('items.menuId', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/orders/:id/status", authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'approved', 'preparing', 'ready', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Populate order for socket emission
    await order.populate('userId', 'name email');
    await order.populate('items.menuId', 'name price');
    
    // Emit order status update for real-time tracking
    io.to(`order-${order.orderNumber}`).emit('orderStatusUpdate', {
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedTime: getEstimatedTime(order.status)
    });
    
    // Also emit to public orders room for public tracking interface
    io.to('public-orders').emit('publicOrderUpdate', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.userId?.name || 'Anonymous',
      estimatedTime: getEstimatedTime(order.status),
      isCompleted: order.status === 'completed'
    });
    
    // Also emit to general newOrder event for admin dashboard
    io.emit('orderStatusChanged', order);
    
    if (status === "completed") {
      if (order.userId) {
        io.to(order.userId.toString()).emit("orderCompleted", { message: "Your order is ready! 🍽️" });
      }
      // Delete the order after 10 seconds
      setTimeout(async () => {
        try {
          await Order.findByIdAndDelete(order._id);
          io.emit('orderDeleted', order._id);
          io.to(`order-${order.orderNumber}`).emit('orderDeleted', order.orderNumber);
          // Notify public tracking interface about deletion
          io.to('public-orders').emit('publicOrderDeleted', order._id);
        } catch (error) {
          console.error('Error deleting order:', error);
        }
      }, 10000);
    }
    res.json(order);
  } catch (error) {
    console.log('Error updating order status:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Menu routes
app.get("/api/menu", async (req, res) => {
  try {
    const menuItems = await Menu.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/menu", authenticate, authorize(['admin']), upload.single('image'), async (req, res) => {
  try {
    const menuItem = new Menu({
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image,
      quantity: parseInt(req.body.quantity),
      available: req.body.available === 'true'
    });
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/menu/:id", authenticate, authorize(['admin']), upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      quantity: parseInt(req.body.quantity),
      available: req.body.available === 'true'
    };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const menuItem = await Menu.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/menu/:id", authenticate, authorize(['admin']), async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Payment routes
app.post("/api/payments/:orderId/process", async (req, res) => {
  try {
    console.log('Processing payment for order:', req.params.orderId);
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    console.log('Payment found:', payment);
    if (!payment) {
      console.log('Payment not found for order:', req.params.orderId);
      return res.status(404).json({ message: 'Payment not found' });
    }
    // Mock processing: always succeed
    payment.status = 'completed';
    await payment.save();
    console.log('Payment saved as completed');
    // Reset user discount after payment
    const order = await Order.findById(req.params.orderId);
    if (order && order.userId) {
      await User.findByIdAndUpdate(order.userId, { discount: 0 });
    }
    res.json({ message: 'Payment processed successfully', payment });
  } catch (error) {
    console.log('Payment processing error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/payments/:orderId/status", async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ status: payment.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Scratch card routes
app.post("/api/scratch-cards", authenticate, async (req, res) => {
  console.log('POST /api/scratch-cards - User:', req.user);
  console.log('ScratchCard model:', ScratchCard);
  try {
    const card = new ScratchCard({ userId: req.user._id });
    await card.save();
    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/scratch-cards", authenticate, async (req, res) => {
  console.log('GET /api/scratch-cards - User:', req.user);
  console.log('ScratchCard model:', ScratchCard);
  try {
    const cards = await ScratchCard.find({ userId: req.user._id });
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/scratch-cards/:id/scratch", authenticate, async (req, res) => {
  try {
    const card = await ScratchCard.findById(req.params.id);
    if (!card || card.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Card not found' });
    }
    if (card.scratched) {
      return res.status(400).json({ message: 'Already scratched' });
    }
    const highPrizeCount = await ScratchCard.countDocuments({ prize: { $gt: 20 }, scratched: true });
    let prize;
    if (highPrizeCount < 4) {
      prize = Math.floor(Math.random() * 30) + 1;
    } else {
      prize = Math.floor(Math.random() * 20) + 1;
    }
    card.prize = prize;
    card.scratched = true;
    await card.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { discount: prize } });
    res.json({ prize });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).catch(err => console.error('MongoDB connection error:', err));

server.listen(process.env.PORT || 5000, () => console.log("Server running"));
