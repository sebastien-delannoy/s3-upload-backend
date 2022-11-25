/*node express app tat uploads and downloads objects from amazon S3*/
var express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
var fileupload = require("express-fileupload");
var amazonS3 = require("aws-sdk");
const { Redshift } = require("aws-sdk");

var app = express();
app.use(cors());
app.use(fileupload());

// Initializing the amazonS3 object.
amazonS3.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET,
  subregion: process.env.REGION,
});

var s3Bucket = new amazonS3.S3({
  params: { Bucket: "sebast-bucket-together" },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// upload route
app.post("/api/upload", function (req, res) {
  if (req.files) {
    var currentTime = new Date();

    var file = req.files.file,
      filename = currentTime + file.name,
      username = req.body.username;

    var params = {
      Key: `${username}/${filename}`,
      Body: file.data,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    // upload file to S3
    s3Bucket.upload(params, function (err, data) {
      if (err) {
        console.log("Error occured while trying to upload to AWS: ", err);
        res.send(err);
      } else {
        console.log("Upload Success", data.Location);
        res.json(data);
      }
    });
  } else {
    console.log("no files");
  }
});

// app listen
app.listen(8080, function () {
  console.log("Working on port 8080");
});
