#!/bin/bash

SITE="https://nsangomagazine.com"
DATA="/var/www/nsango-pulse-africa/data/articles.json"
OUTPUT="/var/www/nsango-pulse-africa/sitemap.xml"

echo "Génération sitemap..."

cat <<EOF > $OUTPUT
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<!-- HOME -->
<url>
  <loc>$SITE/</loc>
</url>

<!-- CATEGORIES -->
<url><loc>$SITE/portraits</loc></url>
<url><loc>$SITE/business</loc></url>
<url><loc>$SITE/culture</loc></url>
<url><loc>$SITE/interviews</loc></url>
<url><loc>$SITE/videos</loc></url>
<url><loc>$SITE/magazine</loc></url>
<url><loc>$SITE/actualites</loc></url>

EOF

# ARTICLES DYNAMIQUES
if [ -f "$DATA" ]; then
  jq -c '.[]' $DATA | while read item; do
    slug=$(echo $item | jq -r '.slug')
    updated=$(echo $item | jq -r '.updatedAt')

    cat <<EOL >> $OUTPUT
<url>
  <loc>$SITE/article/$slug</loc>
  <lastmod>$updated</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>
EOL

  done
fi

echo "</urlset>" >> $OUTPUT

echo "Sitemap SEO PRO généré ✔"
