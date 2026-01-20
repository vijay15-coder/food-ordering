require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Menu = require('./models/Menu');
const User = require('./models/User');
const Order = require('./models/Order');

const sampleMenuItems = [
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    price: 12.99,
    category: 'Main Course',
    image: 'https://example.com/pizza.jpg',
    quantity: 50,
    available: true
  },
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan',
    price: 8.99,
    category: 'Appetizer',
    image: 'https://example.com/salad.jpg',
    quantity: 30,
    available: true
  },
  {
    name: 'Grilled Chicken Burger',
    description: 'Juicy grilled chicken patty with lettuce, tomato, and mayo',
    price: 10.99,
    category: 'Main Course',
    image: 'https://example.com/burger.jpg',
    quantity: 40,
    available: true
  },
  {
    name: 'Chocolate Brownie',
    description: 'Rich chocolate brownie with vanilla ice cream',
    price: 5.99,
    category: 'Dessert',
    image: 'https://example.com/brownie.jpg',
    quantity: 20,
    available: true
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries seasoned with salt',
    price: 4.99,
    category: 'Side',
    image: 'https://example.com/fries.jpg',
    quantity: 60,
    available: true
  },
  {
    name: 'Mojito',
    description: 'Refreshing drink with mint, lime, and soda',
    price: 6.99,
    category: 'Beverage',
    image: 'https://example.com/mojito.jpg',
    quantity: 25,
    available: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    await Menu.deleteMany({}); // Clear existing data
    await Order.deleteMany({}); // Clear existing orders
    console.log('Cleared existing menu items and orders');

    const insertedMenus = await Menu.insertMany(sampleMenuItems);
    console.log('Sample menu items inserted successfully');

    const adminEmail = 'vijay@gmail.com';
    const adminPassword = 'vijaykumar@123';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = new User({
        name: 'Vijay Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Admin user password updated');
    }

    // Create sample customer and order
    const customerEmail = 'customer@example.com';
    const customerPassword = 'password123';
    let customer = await User.findOne({ email: customerEmail });
    if (!customer) {
      const hashedPassword = await bcrypt.hash(customerPassword, 10);
      customer = new User({
        name: 'Sample Customer',
        email: customerEmail,
        password: hashedPassword,
        role: 'customer'
      });
      await customer.save();
      console.log('Sample customer created');
    }

    const existingOrder = await Order.findOne({ userId: customer._id });
    if (!existingOrder) {
      const sampleOrder = new Order({
        userId: customer._id,
        items: [
              { menuId: insertedMenus[0]._id, quantity: 2 },
              { menuId: insertedMenus[1]._id, quantity: 1 }
            ],
        total: insertedMenus[0].price * 2 + insertedMenus[1].price,
        paymentMethod: 'card',
        status: 'pending'
      });
      try {
        await sampleOrder.save();
        console.log('Sample order created');
      } catch (error) {
        console.log('Error creating sample order:', error.message);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();