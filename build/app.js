"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const app = (0, express_1.default)();
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
const port = 5000;
const uri = "mongodb+srv://dbUser:JGbWQtUaES8sUQ5X@cluster0.7phu3.mongodb.net/RockerzzDB?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
app.get("/", (req, res) => {
    res.send("Hello World!");
});
client.connect((err) => {
    const audiosCollection = client.db("RockerzzDB").collection("Audios");
    console.log("database");
    // const usersCollection = client.db("creativeAgency").collection("users");
    // const adminsCollection = client.db("creativeAgency").collection("admins");
    // const reviewsCollection = client.db("creativeAgency").collection("reviews");
    app.post("/uploadAudio", (req, res) => {
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
            file[index].mv(`${__dirname}/audios/${albumName}/${file[index].name}`, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ msg: "Failed To Upload" });
                }
            });
            if (file[index].mimetype === "image/jpeg") {
                imageList.push(fileObj);
            }
            else {
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
            .then((result) => {
            res.send(result.insertedCount > 0);
        });
    });
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
