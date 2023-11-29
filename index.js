"use strict";

const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

app.use(express.json());

// MongoDB Atlas Database Connection String
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.llplsha.mongodb.net/?retryWrites=true&w=majority`;

async function connectDB() {
  try {
    await mongoose.connect(uri)
    console.log("MongoDB Connected");
  } catch (err) {
    console.log(`Mongoose connection error: ${err}`);
    process.exit(1);
  }
}

connectDB();

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

mongoose.connection.on("error", (err) => {
  console.log(`Mongoose connection error: ${err}`);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log(
    "Mongoose default connection disconnected through app termination"
  );
  process.exit(0);
});

// Routes

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({ completed: "false" });
    res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed,
    });
    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
