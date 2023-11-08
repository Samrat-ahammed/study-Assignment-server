const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
var jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(
  cors({
    origin: [
      "https://study-assignment-f59be.web.app/",
      "https://study-assignment-f59be.firebaseapp.com/",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// samratahammed29
// uK2a2DjvyJHj7JJE

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbligoj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log("value of token of middleware", token);
  if (!token) {
    return res.status(401).send({ message: "forbidden" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized" });
    }
    console.log("value in token ", decode);
    req.user = decode;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    const assignmentCollection = client
      .db("assignmentDB")
      .collection("allAssignment");
    const takeAssignmentCollection = client
      .db("takeAssignmentDb")
      .collection("takeAssignment");

    const userCollection = client.db("userDB").collection("user");

    app.get("/allAssignment", async (req, res) => {
      const { level } = req.query;
      let query = {};
      if (level) {
        query = { level: level };
      }

      const cursor = assignmentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/allAssignment", async (req, res) => {
      const assignment = req.body;

      const result = await assignmentCollection.insertOne(assignment);
      res.send(result);
    });

    app.get("/allAssignment/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.findOne(query);
      res.send(result);
    });

    app.put("/allAssignment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateProduct = req.body;

      const updateDoc = {
        $set: {
          title: updateProduct.title,
          description: updateProduct.description,
          mark: updateProduct.mark, // Note the correct property name here (should be "rating" not "Rating")
          imgUrl: updateProduct.imgUrl,
          level: updateProduct.level,
          date: updateProduct.date,
        },
      };
      const result = await assignmentCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/allAssignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/takeAssignment", verifyToken, async (req, res) => {
      const { email } = req.query;
      console.log("token:", req.cookies.token);
      if (req.query.email !== req.user.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      console.log(query);
      const cursor = takeAssignmentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/takeAssignment", async (req, res) => {
      const takeAssign = req.body;
      const result = await takeAssignmentCollection.insertOne(takeAssign);
      res.send(result);
    });

    app.get("/takeAssignment/:status", async (req, res) => {
      const status = req.params.status;
      const query = { status: status };
      const result = await takeAssignmentCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/takeAssignment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateProduct = req.body;

      const updateDoc = {
        $set: {
          giveMark: updateProduct.giveMark,
          status: updateProduct.status,
        },
      };

      const result = await takeAssignmentCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    app.delete("/takeAssignment/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await takeAssignmentCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const cursor = userCollection.find();
      const user = await cursor.toArray();
      res.send(user);
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Study is running");
});

app.listen(port, () => {
  console.log(`Study Server is running on port ${port}`);
});
