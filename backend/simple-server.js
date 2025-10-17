const express = require('express'); const app = express(); app.get('/api/test', (req, res) => res.send('API is working!')); app.listen(5002, () => console.log('Server running on port 5002'));
