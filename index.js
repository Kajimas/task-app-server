"use strict";

const express = require("express");
const app = express();
const env = require("dotenv").config();

app.use(express.json());

// Use mongoose to connect to mongodb
const mongoose = require("mongoose");

// MongoDB Atlas Database Connection String
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.llplsha.mongodb.net/?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Define a schema
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  completed: {
    type: Boolean,
    required: true,
  },
});

const Task = mongoose.model("Task", TaskSchema);

// Task.create({
//   title: "Learn Mongoose",
//   description: "Study Mongoose for MongoDB",
//   completed: "false",
// })
//   .then((task) => console.log("New Task Created:", task))
//   .catch((err) => console.log(err));

// Task.find({ completed: false })
//   .then((tasks) => console.log("Incomplete Tasks:", tasks))
//   .catch((err) => console.log(err));

mongoose.connection.on("error", (err) => {
  console.log(`Mongoose connection error: ${err}`);
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log(
      "Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});

// Middleware

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/api/tasks", (req, res) => {
  Task.find({ completed: "false" })
    .then((tasks) => res.json(tasks))
    .catch((err) => console.log(err));
});

app.post("/api/tasks", (req, res) => {
  Task.create({
    title: req.body.title,
    description: req.body.description,
    completed: req.body.completed,
  })
    .then((task) => res.json(task))
    .catch((err) => console.log(err));
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
