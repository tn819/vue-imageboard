require("dotenv").config();
var spicedPg = require("spiced-pg");

var db = spicedPg(process.env.DATABASE_URL);

exports.getImages = () => {
    let q = "SELECT * FROM images ORDER BY created_at DESC";
    return db.query(q);
};
exports.getImage = id => {
    let q = "SELECT * FROM images WHERE id = $1";
    let params = [id];
    return db.query(q, params);
};
exports.addImage = (url, username, title, description) => {
    let q =
        "INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING id, url, username, title, description";
    let params = [url, username, title, description];
    return db.query(q, params);
};
exports.getComments = id => {
    let q =
        "SELECT * FROM comments WHERE image_id = $1 ORDER BY created_at DESC";
    let params = [id];
    return db.query(q, params);
};
exports.addComment = (comment, username, image_id) => {
    let q =
        "INSERT INTO comments (comment, username, image_id) VALUES ($1, $2, $3) RETURNING id, comment, username, image_id, created_at";
    let params = [comment, username, image_id];
    return db.query(q, params);
};
