require('dotenv').config({ override: true });

// Debug: Log environment variables
console.log('Environment Variables:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Show partial MONGO_URI for debugging (first 50 chars)
if (process.env.MONGO_URI) {
  console.log('MONGO_URI (first 50 chars):', process.env.MONGO_URI.substring(0, 50) + '...');
}

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
    io.to('public-orders').emit('newOrder', { orderNumber: order.orderNumber, status: order.status });
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders for authenticated user
app.get("/api/orders/user", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get approved and completed orders for public tracking
app.get("/api/orders/public", async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: { $in: ['approved', 'completed'] } 
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Track order by order number
app.get("/api/orders/track/:orderNumber", async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: parseInt(req.params.orderNumber) });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/orders/:id", authenticate, authorize(['admin']), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    io.to(`order-${order.orderNumber}`).emit('orderUpdate', order);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/orders/:id", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/menu", async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/menu", authenticate, authorize(['admin']), async (req, res) => {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/menu/:id", authenticate, authorize(['admin']), async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/menu/:id", authenticate, authorize(['admin']), async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/menu/:id/upload-image", upload.single('image'), async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, { image: req.file.filename }, { new: true });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/orders-all", authenticate, authorize(['admin']), async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/discount", authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/scratch-cards", authenticate, async (req, res) => {
  try {
    const cards = await ScratchCard.find({ userId: req.user._id });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create scratch card for customer (not admin only)
app.post("/api/scratch-cards", authenticate, async (req, res) => {
  try {
    // Generate random prize between 50-300 rupees
    const prizes = [50, 75, 100, 125, 150, 175, 200, 250, 300];
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
    
    const card = new ScratchCard({
      userId: req.user._id,
      prize: randomPrize,
      scratched: false,
      createdAt: new Date()
    });
    await card.save();
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Scratch card endpoint
app.put("/api/scratch-cards/:id/scratch", authenticate, async (req, res) => {
  try {
    const card = await ScratchCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    // Verify card belongs to user
    if (card.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    
    if (card.scratched) {
      return res.status(400).json({ message: 'Card already scratched' });
    }
    
    const prize = card.prize;
    const updatedCard = await ScratchCard.findByIdAndUpdate(req.params.id, { scratched: true }, { new: true });
    const user = await User.findByIdAndUpdate(req.user._id, { $inc: { discount: prize } }, { new: true });
    res.json({ user, card: updatedCard, prize });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/scratch-cards/:id", authenticate, async (req, res) => {
  try {
    const card = await ScratchCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    const { prize } = card;
    res.json({ prize });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MongoDB Connection with retry logic and DNS-over-HTTPS SRV fallback
const https = require('https');
const url = require('url');

const parseMongoUri = (uri) => {
  try {
    // basic parse for user:pass and db name
    if (!uri) return {};
    const withoutPrefix = uri.replace('mongodb+srv://', '').replace('mongodb://', '');
    const atIndex = withoutPrefix.indexOf('@');
    let auth = null;
    let rest = withoutPrefix;
    if (atIndex !== -1) {
      auth = withoutPrefix.substring(0, atIndex);
      rest = withoutPrefix.substring(atIndex + 1);
    }
    const slashIndex = rest.indexOf('/');
    const hosts = slashIndex !== -1 ? rest.substring(0, slashIndex) : rest;
    const db = slashIndex !== -1 ? rest.substring(slashIndex + 1).split('?')[0] : '';
    const [user, pass] = auth ? auth.split(':') : [null, null];
    return { user, pass, hosts, db };
  } catch (e) { return {}; }
};

const dohResolve = async (name, type = 'SRV') => {
  const endpoints = [
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    `https://1.1.1.1/dns-query?name=${encodeURIComponent(name)}&type=${type}`
  ];

  for (const dohUrl of endpoints) {
    try {
      const json = await new Promise((resolve, reject) => {
        https.get(dohUrl, { headers: { 'Accept': 'application/dns-json' } }, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch (err) { reject(err); }
          });
        }).on('error', reject);
      });
      if (json && json.Answer && json.Answer.length) return json;
      // if no Answer, continue to next endpoint
    } catch (err) {
      // ignore and try next DOH provider
    }
  }
  // If all DOH providers failed or returned no answers, return null
  return null;
};

const buildDirectUriFromSrv = async (srvName, originalUri) => {
  try {
    const srv = await dohResolve(srvName, 'SRV');
    if (!srv || !srv.Answer) return null;
    // Collect targets
    const targets = srv.Answer.map(a => a.data).filter(Boolean);
    const hostPorts = [];
    for (const t of targets) {
      // t format: "priority weight port target"
      const parts = t.split(' ');
      const port = parts[2];
      const targetHost = parts[3].replace(/\.$/, '');
      // resolve A for targetHost
      const a = await dohResolve(targetHost, 'A');
      if (a && a.Answer) {
        const ips = a.Answer.map(x => x.data);
        // use first IP for connection
        hostPorts.push(`${ips[0]}:${port}`);
      } else {
        // fallback to using hostname
        hostPorts.push(`${targetHost}:${port}`);
      }
    }
    const { user, pass, db } = parseMongoUri(originalUri);
    if (!hostPorts.length) return null;
    const auth = user && pass ? `${user}:${pass}@` : '';
    const direct = `mongodb://${auth}${hostPorts.join(',')}/${db}?ssl=true&authSource=admin&retryWrites=true&w=majority`;
    return direct;
  } catch (err) {
    return null;
  }
};

const connectMongo = async () => {
  const baseUri = process.env.MONGO_URI || 'mongodb://localhost:27017/food';
  try {
    await mongoose.connect(baseUri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 15000, socketTimeoutMS: 45000 });
    console.log('✅ MongoDB connected successfully!');
    return;
  } catch (err) {
    console.error('❌ MongoDB initial connection failed:', err.message);
    // If it's a DNS SRV resolution error, try DNS-over-HTTPS fallback
    if (err.message && err.message.includes('ENOTFOUND') && baseUri.startsWith('mongodb+srv://')) {
      console.log('Attempting DNS-over-HTTPS SRV resolution fallback...');
      const srvName = `_mongodb._tcp.${baseUri.split('@').pop().split('/')[0]}`;
      const direct = await buildDirectUriFromSrv(srvName, baseUri);
      if (direct) {
        try {
          console.log('Trying direct URI constructed from SRV:', direct.substring(0, 100) + '...');
          await mongoose.connect(direct, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 15000, socketTimeoutMS: 45000 });
          console.log('✅ MongoDB connected successfully via direct IPs!');
          return;
        } catch (err2) {
          console.error('❌ Direct IP connection failed:', err2.message);
        }
      } else {
        console.error('Could not construct direct connection URI from SRV records');
      }
    }
    console.log('Retrying initial connection in 5 seconds...');
    setTimeout(connectMongo, 5000);
  }
};

connectMongo();

server.listen(process.env.PORT || 5000, () => console.log("Server running"));
