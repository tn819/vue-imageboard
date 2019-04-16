const express = require("express");
const app = express();
const db = require("./utils/db");

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

app.listen(process.env.PORT || 8080, () => console.log("listening..."));
