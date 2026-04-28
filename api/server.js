
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const FILE = "/var/www/nsango-pulse-africa/data/articles.json";

// sécurité minimale
function readData() {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function writeData(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// GET
app.get("/articles", (req, res) => {
    res.json(readData());
});

// POST (ADMIN)
app.post("/articles", (req, res) => {
    const data = readData();

    // ✅ validation
    if (!req.body.title) {
        return res.status(400).json({
            error: "Titre obligatoire"
        });
    }

    // ✅ génération slug automatique
    let slug = req.body.slug || req.body.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-");

    // ✅ éviter doublons
    const exists = data.find(a => a.slug === slug);
    if (exists) {
        return res.status(400).json({
            error: "Slug déjà utilisé"
        });
    }

    const now = new Date();

    const article = {
        id: data.length + 1,
        slug: slug,
        title: req.body.title,

        // SEO
        description: req.body.title + " - Actualité Afrique | Nsango Magazine",

        keywords: req.body.title
            .toLowerCase()
            .replace(/[^\w\s]/gi, "")
            .split(" ")
            .filter(word => word.length > 3),

        // contenu
        image: req.body.image || "https://nsangomagazine.com/default.jpg",
        author: req.body.author || "Nsango Magazine",

        // dates
        publishedAt: now.toISOString(),
        updatedAt: now.toISOString().split("T")[0]
    };

    data.push(article);
    writeData(data);

    res.json({
        success: true,
        message: "Article publié avec succès",
        article
    });
});

// protection crash
process.on("uncaughtException", (err) => {
    console.error("Crash évité:", err);
});

app.listen(3001, () => {
    console.log("API stable sur port 3001");
});
