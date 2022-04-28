import express, { Application, Request, Response } from "express";
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://dbUser:8NDok8kAl1aFKBAx@cluster0.7phu3.mongodb.net/PracticeDB?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const app: Application = express();
app.use(bodyParser.json());
app.use(cors());
const port: number = 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

client.connect((err: any) => {
  const collection = client.db("PracticeDB").collection("Practice");
  app.post("/add", (req, res) => {
    const newAdd = req.body;
    collection.insertOne(newAdd).then((result: any) => {
      console.log(result);
    });
  });

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
