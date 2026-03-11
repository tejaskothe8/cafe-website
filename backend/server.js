const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const dotenv  = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Routes ──────────────────────────────────
app.use('/api/auth',   require('./routes/authroutes'));
app.use('/api/orders', require('./routes/orderroutes'));

app.get('/', (_req, res) => res.json({ message: '☕ Cafe API running' }));

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`☕ Server running on http://localhost:${PORT}`)
);