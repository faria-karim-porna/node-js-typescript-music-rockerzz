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
console.log("cloud_name", cloudinary.config().cloud_name);

cloudinary.uploader
  .upload(
    `${__dirname}/audios/3 Idiots/Aal Izz Well  3 Idiots  Aamir Khan Madhavan Sharman J  Sonu N Swanand K  Shaan  Shantanu M.mp3`,
    { public_id: "audios/3 Idiots/Aal Izz Well", resource_type: "auto" }
  )
  .then((result: any) => {
    console.log("Success", JSON.stringify(result, null, 2));
  })
  .catch((error: any) => {
    console.log("error", JSON.stringify(error, null, 2));
  });

const app: Application = express();
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
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

    const imageList = [];
    const musicList = [];
    fs.mkdirSync(`${__dirname}/audios/${albumName}`);
    for (let index = 0; index < file.length; index++) {
      const fileObj = {
        contentType: file[index].mimetype,
        size: file[index].size,
        filePath: `audios/${albumName}/${file[index].name}`,
      };
      file[index].mv(
        `${__dirname}/audios/${albumName}/${file[index].name}`,
        (err: any) => {
          if (err) {
            console.log(err);
            return res.status(500).send({ msg: "Failed To Upload" });
          }
        }
      );
      if (file[index].mimetype === "image/jpeg") {
        imageList.push(fileObj);
      } else {
        musicList.push(fileObj);
      }
    }
    console.log("body ", req.body, "files ", req.files);

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
        res.send(result.insertedCount > 0);
      });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
