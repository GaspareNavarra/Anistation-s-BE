import express from 'express';
import axios from 'axios';

//-----------------------Default(Start)-----------------------//
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('AniStation Backend è attivo!');
});
//-----------------------Default(End)-----------------------//




//-----------------------Main(Start)-----------------------//

//Retrieve search data
app.get('/search', async (req, res) => {
  // Prende la keyword dalla query string ?keyword=...
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({ error: "Devi passare una keyword" });
  }

  try {
    const result = await searchAnime(keyword);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});










//-----------------------Main(End)-----------------------//




//-----------------------Funzioni(Start)-----------------------//

async function searchAnime(keyword) {
	//TODO: attualmente ritorna solo la pagina html della ricerca, sistemare ritornando i dati che invece vengono visualizzati
  // const url = `https://www.animeworld.ac/api/search/v2?keyword=${encodeURIComponent(keyword)}`;
  const url = `https://www.animeworld.ac/search?keyword=${encodeURIComponent(keyword)}`;

	console.log(url.replaceAll("%20", "+"));
  const response = await axios.get(url.replaceAll("%20", "+"), null, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://www.animeworld.ac",
      "Origin": "https://www.animeworld.ac",
      "X-Requested-With": "XMLHttpRequest"
    }
    // timeout: 5000
  });

  return response.data;
}
//-----------------------Funzioni(End)-----------------------//




//-----------------------Listener(Start)-----------------------//

app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
//-----------------------Listener(End)-----------------------//