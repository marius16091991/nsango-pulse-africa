const express = require('express');
const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');

const app = express();

// 👉 Liste des routes React (IMPORTANT)
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  // Ajoute ici tes routes React futures :
  // { url: '/article/1' },
];

// Génération sitemap
app.get('/sitemap.xml', async (req, res) => {
  const sitemap = new SitemapStream({
    hostname: 'https://nsangomagazine.com'
  });

  res.header('Content-Type', 'application/xml');

  streamToPromise(
    require('stream').Readable.from(links).pipe(sitemap)
  ).then(data => {
    res.send(data.toString());
  });
});

// serveur simple
app.listen(3001, () => {
  console.log('Sitemap server running on port 3001');
});
