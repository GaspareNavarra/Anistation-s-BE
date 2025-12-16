import express from "express";
import axios from "axios";
import fs, { link } from "fs";
import HeaderSettings from "./HeaderSettings.json";
import constant from "./constant";

//-----------------------Default(Start)-----------------------//
const app = express();
const port = 3000;
let headers = {};

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AniStation Backend è attivo!");
});
//-----------------------Default(End)-----------------------//

//-----------------------Main(Start)-----------------------//

//Retrieve search data
app.get("/search", async (req, res) => {
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

//Retrieve downloaded episode
// Recuperare il codice identificativo della puntata

// Body
// {
//   link: "",
//   identifier: ""
// }
app.get("/download", async (req, res) => {
  // link + identifier
  try {
    const response = await downloadAllEpisode(req.body);
    res.send(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//-----------------------Main(End)-----------------------//

//-----------------------Funzioni(Start)-----------------------//

async function searchAnime(keyword, res) {
  const url = `https://www.animeworld.ac/api/search/v2?keyword=${encodeURIComponent(
    keyword
  )}`;

  console.log("Eseguo [searchAnime] con url: " + url.replaceAll("%20", "+"));

  const response = await axios.post(url.replaceAll("%20", "+"), null, {
    headers
  });

  return response.data;
}

async function downloadAllEpisode(body) {
  const getEpisodeIdUrl =
    constant.animeworldHomePageUrl +
    "play/" +
    body.link +
    "." +
    body.identifier;

  const response = await axios.get(getEpisodeIdUrl, null, {
    headers
  });

  const ids = extractEpisodeIds(response.data);

  const linkEpisodes = await getDownloadLinkEpisode(ids);

}

async function getDownloadLinkEpisode(ids) {

}

function extractEpisodeIds(html) {
  const ids = [];
  let index = 0;

  while ((index = html.indexOf('data-episode-id="', index)) !== -1) {
    const start = index + 17;
    const end = html.indexOf('"', start);
    ids.push(html.substring(start, end));
    index = end;
  }

  return ids;
}

async function updateHeaderSettings(res) {
  try {
    const response = await axios.get(constant.animeworldHomePageUrl, null, {
      headers,
    });

    const startingIndex = response.data.indexOf('id="csrf-token"');
    const contentStart =
      response.data.indexOf('content="', startingIndex) + 'content="'.length;
    const contentEnd = response.data.indexOf('"', contentStart);

    const csrfToken = response.data.substring(contentStart, contentEnd);
    console.log("Il token recuperato é: " + csrfToken);

    const cookie = response.headers["set-cookie"].join(";");
    console.log("I cookie sono: " + cookie);

    saveHeaderSettings({
      CsrfToken: csrfToken,
      Cookie: cookie,
    });
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
  updateHeaderSettings(res);
  headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    Referer: "https://www.animeworld.ac",
    Origin: "https://www.animeworld.ac",
    "X-Requested-With": "XMLHttpRequest",
    "Csrf-Token": HeaderSettings.CsrfToken,
    Cookie: HeaderSettings.Cookie,
  };
  console.log(`Server avviato su http://localhost:${port}`);
});
//-----------------------Listener(End)-----------------------//
