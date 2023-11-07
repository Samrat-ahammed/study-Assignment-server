const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// samratahammed29
// uK2a2DjvyJHj7JJE

const uri =
  "mongodb+srv://samratahammed29:uK2a2DjvyJHj7JJE@cluster0.kbligoj.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const assignmentCollection = client
      .db("assignmentDB")
      .collection("allAssignment");
    const takeAssignmentCollection = client
      .db("takeAssignmentDb")
      .collection("takeAssignment");

    app.get("/allAssignment", async (req, res) => {
      const cursor = assignmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/allAssignment", async (req, res) => {
      const assignment = req.body;
      console.log(assignment);
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
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.deleteOne(query);
      res.send(result);
    });

    // app.patch("/allAssignment/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const updateChecking = req.body;
    //   // console.log(updateChecking);
    //   const updateDoc = {
    //     $set: {
    //       status: updateChecking.status,
    //     },
    //   };

    //   const result = await assignmentCollection.updateOne(filter, updateDoc);
    //   console.log(result);
    //   res.send(result);
    // });

    app.get("/takeAssignment", async (req, res) => {
      const cursor = takeAssignmentCollection.find();
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    app.post("/takeAssignment", async (req, res) => {
      const takeAssign = req.body;
      console.log(takeAssign);
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
      console.log(id);
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
