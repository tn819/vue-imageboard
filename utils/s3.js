const knox = require("knox-s3");
const fs = require("fs");
require("dotenv").config();

const client = knox.createClient({
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,
    bucket: "tnstorage-personal"
});

exports.upload = (req, res, next) => {
    if (!req.file) {
        return res.sendStatus(500);
    }
    const s3Request = client.put(req.file.filename, {
        "Content-Type": req.file.mimetype,
        "Content-Length": req.file.size,
        "x-amz-acl": "public-read"
    });
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on("response", s3Response => {
        if (s3Response.statusCode == 200) {
            next();
            fs.unlink(req.file.path, () => {});
        } else {
            console.log(s3Response.statusCode);
            res.sendStatus(500);
        }
    });
};
