const express = require('express');
const cors    = require('cors');
const path    = require('path');
const app     = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/team',     require('./routes/team'));

app.get('/api/health', (req,res) => res.json({ status:'ok', time:new Date().toISOString() }));

// Serve React in production
const dist = path.join(__dirname,'..','frontend','dist');
app.use(express.static(dist));
app.get('*', (req,res) => res.sendFile(path.join(dist,'index.html')));

app.use((err,req,res,next) => { console.error(err.stack); res.status(500).json({ error:'Internal server error' }); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅  Ethara API → http://localhost:${PORT}`));
