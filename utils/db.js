const dotenv = require("dotenv");
var spicedPg = require("spiced-pg");

var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:tneil:postgres@localhost:5432/imageboard"
);

exports.getImages = () => {
    let q = "SELECT * FROM images";
    return db.query(q);
};
