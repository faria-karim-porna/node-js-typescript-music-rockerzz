import express, { Application, Request, Response } from "express";
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const fileUpload = require("express-fileupload");

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
    const file = req.files.file;
    // const serviceTitle = req.body.serviceTitle;
    // const serviceDescription = req.body.serviceDescription;
    // console.log(file);
    const imageList = [];
    const musicList = [];
    // const serviceTitle = req.body.serviceTitle;
    // const serviceDescription = req.body.serviceDescription;
    for (let index = 0; index < file.length; index++) {
      const newFile = file[index].data;
      const encFile = newFile.toString("base64");
      const fileObj = {
        contentType: file[index].mimetype,
        size: file[index].size,
        img: Buffer.from(encFile, "base64"),
      };
      if (file[index].mimetype === "image/jpeg") {
        imageList.push(fileObj);
      } else {
        musicList.push(fileObj);
      }
    }

    audiosCollection.insertOne({ imageList, musicList }).then((result: any) => {
      res.send(result.insertedCount > 0);
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
