"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = "mongodb+srv://dbUser:8NDok8kAl1aFKBAx@cluster0.7phu3.mongodb.net/PracticeDB?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
const app = (0, express_1.default)();
app.use(bodyParser.json());
app.use(cors());
const port = 5000;
app.get("/", (req, res) => {
    res.send("Hello World!");
});
client.connect((err) => {
    const collection = client.db("PracticeDB").collection("Practice");
    app.post("/add", (req, res) => {
        const newAdd = req.body;
        collection.insertOne(newAdd).then((result) => {
            console.log(result);
        });
    });
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
