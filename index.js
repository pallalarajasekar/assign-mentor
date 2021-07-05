require('dotenv').config();
const { response } = require("express");
const express = require("express");
const mongodb = require("mongodb");


const port = process.env.PORT || 9090;

const DBURL =  process.env.MONGO_URI || "mongodb://127.0.0.1:27017";


//const DBURL =  "mongodb+srv://raja:GI2ZD5XbjZLFAk9y@cluster0.bxjct.mongodb.net/mentorStudent?retryWrites=true&w=majority";

//const DBURL = "mongodb://127.0.0.1:27017";
console.log(DBURL);
const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;

const app = express();
app.use(express.json());

//Insert student data
app.post("/insert-student", async (req, res) => {
  try {

    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("student").insertOne(req.body);
    res.status(200).json({ "message": "inserted student data" });
    client.close();

  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.get("/", async (req, res) => {
  try {
    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("student").find().toArray();
    res.status(200).send(doc);
    client.close();

  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

//find the student data list
app.get("/find-student", async (req, res) => {
  try {
    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("student").find().toArray();
    res.status(200).send(doc);
    client.close();

  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

//update student contact
app.put("/update-student", async (req, res) => {
  try {
    console.log(req.body);
    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("student").updateOne({ "email": req.body.email }, { $set: { "contact": req.body.contact } });
    res.status(200).json({ "message": "updated contact number successfully" })
    client.close();

  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//delete student data
app.delete("/delete-student/:id", async (req, res) => {
  try {
    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("student").deleteOne({ _id: objectId(req.params.id) });
    res.status(200).json({ "message": "deleted student successfully" });
    client.close();

  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//Assigned menter for student
app.put("/assign-mentor/:id", async (req, res) => {
  try {
    console.log(req.body);
    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("mentor").findOne({ "email": req.body.mentorEMail });
    console.log(doc);
    if (doc != null) {
      const doc1 = await db.collection("student").updateOne({ _id: objectId(req.params.id) }, { $set: { mentor: [doc] } })
      res.status(200).json({ "message": "assigned menter for student " })
      client.close();
    }else{
      res.status(200).json({ "message": "mentor name is not avaliable"})
      client.close();
    }

  } catch (error) {

    console.log(error)
    res.statusCode(500);
  }
})

//Insert mentor data
app.post("/insert-mentor", async (req, res) => {
  try {
    console.log(req.body);
    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("mentor").insertOne(req.body);
    res.status(200).json({ "message": "inserted menter data" })
    client.close();

  } catch (error) {
    console.log(error);
    response.sendStatus(500);
  }
})

//fint the mentor data list
app.get("/find-mentor", async (req, res) => {
  try {

    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("mentor").find().toArray();
    res.status(200).send(doc);
    client.close();

  } catch (error) {
    console.log(error);
    res.statusCode(500);

  }
})

//update mentor conatct and experience
app.put("/update-mentor", async (req, res) => {

  try {

    console.log(req.body);
    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("mentor").updateOne({ "email": req.body.email }, { $set: { "contact": req.body.contact, "exp": req.body.exp } });
    res.status(200).json({ "message": "updated mentor data successfull" })
    client.close();

  } catch (error) {

    console.log(error);
    res.sendStatus(500);

  }
})

//delete mentor data
app.delete("/delete-mentor/:id", async (req, res) => {
  try {

    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("mentor").deleteOne({ _id: objectId(req.params.id) });
    res.status(200).json("deleted mentor data successfull")
    client.close();

  } catch (error) {

    console.log(error);
    res.sendStatus(500);

  }
})

//Assign a multiple student to Mentor

app.put("/assign-student/:id", async(req, res) => {
  try {
    
    console.log("multiple student assign" +req.body.subject);
    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("student").find( {$or:[{trainingSubject: req.body.trainingSubject},{firstname:req.body.firstname}]}, { projection: {_id:0, firstname:1, contact:1, email:1 } } ).toArray();
    console.log(doc);
    if (doc.length != 0) {
      //console.log(doc)
      const doc1 = await db.collection("mentor").updateMany({ _id: objectId(req.params.id) }, { $set: { student: doc } }, {
        upsert: false,
        multi: true
      } )
      res.status(200).json({ "message": "Assign a multiple student to Mentor"})
      client.close();
    }else{
      console.log(doc)
      res.status(200).json({ "message": "student name is not avaliable"})
      client.close();
    }
  } catch (error) {

    console.log(error);
    res.sendStatus(500);
  }
})

// get student details particular mentor
app.get("/studentList-mentor/:id", async(req, res) => {
  try {

    console.log(req.params.id);
    const client = await mongoClient.connect(DBURL);
    const db = client.db("mentorStudent");
    const doc = await db.collection("mentor").find( {_id: objectId(req.params.id)}, { projection: { _id:0, student:1} } ).toArray();
    res.status(200).send(doc);
    client.close();

  } catch (error) {
    console.log(error);
    client.close();
    
  }
})


app.listen(port, () => {
  console.log(`::: server is 🚀 on http://localhost:${port} :::`);
});