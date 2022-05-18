"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const fileUpload = require("express-fileupload");
const fs = require("fs");
dotenv_1.default.config();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = (0, express_1.default)();
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
require("dotenv").config();
const port = 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7phu3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
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
                .then((result) => {
                fileCount = fileCount + 1;
                fileObj = {
                    contentType: file[index].mimetype,
                    size: file[index].size,
                    filePath: result.url,
                };
                if (file[index].mimetype === "image/jpeg") {
                    imageList.push(fileObj);
                }
                else {
                    musicList.push(fileObj);
                }
            })
                .then((result) => {
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
                        .then((result) => {
                        console.log("Inserted Successfully");
                    });
                }
            })
                .catch((error) => {
                console.log("error", error.substring(0, 100));
            });
        }
    });
});
app.listen(process.env.PORT || port);
