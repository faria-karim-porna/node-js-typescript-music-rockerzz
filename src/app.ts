import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const fileUpload = require("express-fileupload");
const fs = require("fs");

dotenv.config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app: Application = express();
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
require("dotenv").config();
const port: number = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7phu3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
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
    let fileObj = {};
    let fileCount = 0;
    for (let index = 0; index < file.length; index++) {
      const encFile = file[index].data.toString("base64");
      const uploadedFile = `data:${file[index].mimetype};base64,` + encFile;
      cloudinary.uploader
        .upload(uploadedFile, {
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
              .then((result: any, err: any) => {
                if (err) {
                  console.log("error");
                  res.send(err);
                } else {
                  console.log("Inserted Successfully");
                  res.status(200).send();
                }
              });
          }
        })
        .catch((error: any) => {
          console.log("error", error.substring(0, 100));
        });
    }
  });
});

app.listen(process.env.PORT || port);
