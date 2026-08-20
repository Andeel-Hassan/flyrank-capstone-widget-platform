require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
const widgetRoutes = require('./routes/widget.routes');
app.use('/api/widgets', widgetRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});