// src/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authUserRoutes = require('./routes/authUser');
const authAdminRoutes = require('./routes/authAdmin');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');
const adminRoutes = require('./routes/admin');
const authService = require('./services/authService');

const { errorHandler } = require('./utils/error');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth/user', authUserRoutes);
app.use('/api/auth/admin', authAdminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

authService.ensureDefaultAdmin()
  .catch((err) => {
    console.error('[Admin Seed Error]', err.message);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });

module.exports = app; // for testing
