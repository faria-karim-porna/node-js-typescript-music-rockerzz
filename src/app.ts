import express, { Application, Request, Response } from "express";
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const fileUpload = require("express-fileupload");
const fs = require("fs");

require("dotenv").config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "derj0f1pt",
  api_key: "571272884278399",
  api_secret: "q4DwAlyepHvpv4Sv7kgG0FhIo7Q",
});

const app: Application = express();
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
require("dotenv").config();
const port: number = 5000;

const uri =
  "mongodb+srv://dbUser:JGbWQtUaES8sUQ5X@cluster0.7phu3.mongodb.net/RockerzzDB?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

client.connect((err: any) => {
  const audiosCollection = client.db("RockerzzDB").collection("Audios");
  console.log("database");
  // const usersCollection = client.db("creativeAgency").collection("users");
  // const adminsCollection = client.db("creativeAgency").collection("admins");
  // const reviewsCollection = client.db("creativeAgency").collection("reviews");

  app.post("/uploadAudio", (req: any, res: Response) => {
    const albumName = req.body.albumName;
    const downloads = req.body.downloads;
    const favoriteTo = req.body.favoriteTo;
    const uploadingDate = req.body.uploadingDate;
    const file = req.files.file;

    const imageList: any = [];
    const musicList: any = [];
    fs.mkdirSync(`${__dirname}/audios/${albumName}`);
    let fileObj = {};
    let fileCount = 0;
    for (let index = 0; index < file.length; index++) {
      file[index].mv(
        `${__dirname}/audios/${albumName}/${file[index].name}`,
        (err: any) => {
          if (err) {
            console.log(err);
            return res.status(500).send({ msg: "Failed To Upload" });
          }
        }
      );

      cloudinary.uploader
        .upload(`${__dirname}/audios/${albumName}/${file[index].name}`, {
          public_id: `audios/${albumName}/${file[index].name}`,
          resource_type: "auto",
        })
        .then((result: any) => {
          fileCount = fileCount + 1;
          fileObj = {
            contentType: file[index].mimetype,
            size: file[index].size,
            filePath: result.url,
          };
          if (file[index].mimetype === "image/jpeg") {
            imageList.push(fileObj);
          } else {
            musicList.push(fileObj);
          }
        })
        .then((result: any) => {
          if (fileCount === file.length) {
            audiosCollection
              .insertOne({
                albumName,
                downloads,
                favoriteTo,
                uploadingDate,
                imageList,
                musicList,
              })
              .then((result: any) => {
                fs.rmdirSync(`${__dirname}/audios/${albumName}`, {
                  recursive: true,
                });
                console.log("Successfully Inserted");
                res.send(result.insertedCount > 0);
              });
          }
        })
        .catch((error: any) => {
          console.log("error", JSON.stringify(error, null, 2));
        });
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
