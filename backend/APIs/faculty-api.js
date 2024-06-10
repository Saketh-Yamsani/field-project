const exp = require("express");
const facultyApp = exp.Router();
const bcryptjs = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("../Middlewares/verifytoken");

facultyApp.use(exp.json());

let facultycollection;
let studentsdatacollection;

facultyApp.use((req, res, next) => {
  facultycollection = req.app.get("facultycollection");
  studentsdatacollection = req.app.get("studentsdatacollection");
  next();
});

// Faculty registration route
facultyApp.post(
  "/users",
  expressAsyncHandler(async (req, res) => {
    const newAuthor = req.body;
    const dbAuthor = await facultycollection.findOne({ username: newAuthor.username });
    if (dbAuthor !== null) {
      res.send({ message: "Faculty existed" });
    } else {
      const hashedPass = await bcryptjs.hash(newAuthor.password, 10);
      newAuthor.password = hashedPass;
      await facultycollection.insertOne(newAuthor);
      res.send({ message: "Faculty created" });
    }
  })
);

// Faculty login
facultyApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    try {
      const authorCred = req.body;
      const dbAuthor = await facultycollection.findOne({ username: authorCred.username });
      if (!dbAuthor) {
        return res.status(400).send({ message: "Invalid username" });
      }

      const status = await bcryptjs.compare(authorCred.password, dbAuthor.password);
      if (!status) {
        return res.status(400).send({ message: "Invalid password" });
      }

      const signedToken = jwt.sign(
        { username: dbAuthor.username, userType: "author" },
        process.env.SECRET_KEY,
        { expiresIn: '1d' }
      );

      res.send({
        message: "login success",
        token: signedToken,
        user: dbAuthor,
      });
    } catch (error) {
      console.error("Error during faculty login:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  })
);

// Add a new POST route to store multiple documents into studentsdatacollection
facultyApp.post(
  "/upload",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      console.log('Hello')
      const studentDataArray = req.body;
      if (!Array.isArray(studentDataArray)) {
        return res.status(400).send({ message: 'Invalid data format. Expected an array of objects.' });
      }
      console.log(studentDataArray)
      console.log("frgdh")
      await studentsdatacollection.deleteMany({}); 
      await studentsdatacollection.insertMany(studentDataArray);
      res.send({ message: "Student data stored successfully", });
    } catch (error) {
      console.error("Error while storing student data:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  })
);

// Route to fetch all student data
facultyApp.get(
  "/fetch",
  expressAsyncHandler(async (req, res) => {
    try {
      const studentsData = await studentsdatacollection.find().toArray();
      res.json(studentsData);
    } catch (error) {
      console.error("Error while fetching student data:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  })
);

// Route to fetch filtered/sorted student data
facultyApp.get(
  "/fetch-filtered",
  expressAsyncHandler(async (req, res) => {
    try {
      const { sortField, sortOrder, minSalary, maxSalary, duration, search } = req.query;

      // Construct the query object
      let query = {};

      if (search) {
        query.Name = { $regex: new RegExp(search, "i") };
      }

      // Fetch data from the database
      let studentsData = await studentsdatacollection.find(query).toArray();

      // Sorting the data
      if (sortField) {
        studentsData.sort((a, b) => {
          if (sortField === 'Name') {
            return a.Name.localeCompare(b.Name);
          } else if (sortField === 'Stipend') {
            return parseFloat(a.Stipend) - parseFloat(b.Stipend);
          } else if (sortField === 'Duration') {
            return a.Duration.localeCompare(b.Duration);
          }
          return 0;
        });

        if (sortOrder === 'desc') {
          studentsData.reverse();
        }
      }

      // Send the response
      res.json(studentsData);
    } catch (error) {
      console.error("Error while fetching student data:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  })
);


module.exports = facultyApp;
