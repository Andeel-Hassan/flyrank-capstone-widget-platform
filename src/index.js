require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: '1y', // versioned bundle — cache long
}));
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
const widgetRoutes = require('./routes/widget.routes');
app.use('/api/widgets', widgetRoutes);
const publicWidgetRoutes = require('./routes/publicWidget.routes');
app.use('/widgets', publicWidgetRoutes);
const submissionRoutes = require('./routes/submission.routes');
app.use('/api/submissions', submissionRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});