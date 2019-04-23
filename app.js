const express = require("express");
const app = express();
const db = require("./utils/db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const config = require("./config.json");
const s3 = require("./utils/s3");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});
app.use(require("body-parser").json());
app.use(express.static("./public"));

app.get("/images", (req, res) => {
    db.getImages()
        .then(results => {
            const { rows } = results;
            res.json(rows);
        })
        .catch(err => console.log(err));
});
app.get("/images/:id", (req, res) => {
    db.getImage(req.params.id)
        .then(results => {
            const { rows } = results;
            res.json(rows[0]);
        })
        .catch(err => console.log(err));
});
app.get("/comments/:id", (req, res) => {
    db.getComments(req.params.id)
        .then(results => {
            const { rows } = results;
            res.json(rows);
        })
        .catch(err => console.log(err));
});

app.post("/comment", (req, res) => {
    //recreate comments table correctly, write remaining code
    const { comment, username, image_id } = req.body;

    db.addComment(comment, username, image_id)
        .then(results => {
            const { rows } = results;
            res.json(rows);
        })
        .catch(err => console.log(err));
});

app.post("/image", uploader.single("file"), s3.upload, (req, res) => {
    const url = config.s3Url + req.file.filename;
    const { username, title, description } = req.body;
    db.addImage(url, username, title, description)
        .then(results => {
            console.log(results);
            const { rows } = results;
            res.json(rows);
        })
        .catch(err => console.log(err));
});

app.listen(process.env.PORT || 8080, () => console.log("listening..."));
