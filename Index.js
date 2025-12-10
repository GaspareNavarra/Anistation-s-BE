const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.send('AniStation Backend è attivo!');
});

app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
