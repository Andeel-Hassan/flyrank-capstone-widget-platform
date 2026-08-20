require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: '1y',
}));

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const widgetRoutes = require('./routes/widget.routes');
app.use('/api/widgets', widgetRoutes);

const publicWidgetRoutes = require('./routes/publicWidget.routes');
app.use('/widgets', publicWidgetRoutes);

const submissionRoutes = require('./routes/submission.routes');

const submissionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' },
});

const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});