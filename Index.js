import express from 'express';
import axios from 'axios';
import fs from "fs";
import HeaderSettings from './HeaderSettings.json';
import constant from './constant';

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
    const result = await searchAnime(keyword, res);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});










//-----------------------Main(End)-----------------------//




//-----------------------Funzioni(Start)-----------------------//

async function searchAnime(keyword, res) {
  const url = `https://www.animeworld.ac/api/search/v2?keyword=${encodeURIComponent(keyword)}`;

  updateHeaderSettings(res);
  
  
	console.log("Eseguo [searchAnime] con url: " + url.replaceAll("%20", "+"));
  
  const response = await axios.post(url.replaceAll("%20", "+"), null, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://www.animeworld.ac",
      "Origin": "https://www.animeworld.ac",
      "X-Requested-With": "XMLHttpRequest",
      'Csrf-Token': HeaderSettings.CsrfToken,
      'Cookie': HeaderSettings.Cookie
    },
    timeout: 5000
  });

  return response.data;
}

async function updateHeaderSettings(res) {
  try {
    const response = await axios.get(constant.animeworldHomePageUrl, null, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://www.animeworld.ac",
        "Origin": "https://www.animeworld.ac",
        "X-Requested-With": "XMLHttpRequest",
        'Csrf-Token': HeaderSettings.CsrfToken,
        'Cookie': HeaderSettings.Cookie
      },
      timeout: 5000
    });

    // "CsrfToken": "sAtdJGOp-2WkBBQqxEgYwSds39YzPvymAuXk",
    // "Cookie": "UGVyc2lzdFN0b3JhZ2U=%7B%7D; _ga=GA1.1.818181000.1748334398; __PPU_puid=16704000774842301575; _ga_ZWP0EVD4M9=GS2.1.s1760017830$o6$g1$t1760018725$j60$l0$h0; sessionId=s%3Af6mK54IlPLMg90q_nSvTIlBXOfpmkWRK.N0gWYAcKyCOtHHD4QuFBSum8ktaXQYw38QWeQjoiScQ"
    
    const startingIndex = response.data.indexOf('id="csrf-token"');
    const contentStart = response.data.indexOf('content="', startingIndex) + 'content="'.length;
    const contentEnd = response.data.indexOf('"', contentStart);
    const csrfToken = response.data.substring(contentStart, contentEnd);


    console.log("Il token recuperato é: " + csrfToken);
    // const cookie = 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function loadHeaderSettings() {
  const raw = fs.readFileSync("./HeaderSettings.json", "utf8");
  return JSON.parse(raw);
}

function saveHeaderSettings(data) {
  fs.writeFileSync("./HeaderSettings.json", JSON.stringify(data, null, 4));
}

//-----------------------Funzioni(End)-----------------------//



//-----------------------Listener(Start)-----------------------//

app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
//-----------------------Listener(End)-----------------------//