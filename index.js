"use strict";

const express = require("express"); // import express
const mongoose = require("mongoose"); // import mongoose
const cors = require("cors"); // import cors
const winston = require("winston"); // import winston
const app = express(); // create express app
require("dotenv").config();


const corsOptions = {
  origin: 'https://task-app-page.onrender.com/', // or the URL of your frontend application
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};


// Middleware
app.use(express.json());
app.use(cors(corsOptions));


// MongoDB Atlas Database Connection String
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.llplsha.mongodb.net/?retryWrites=true&w=majority`;

// Connect to MongoDB Atlas
async function connectDB() {
  try {
    await mongoose.connect(uri);
    logger.log("info", "MongoDB Connected");
  } catch (err) {
    logger.error(`Mongoose connection error: ${err}`);
    process.exit(1);
  }
}

// Call the connectDB function
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

// Compile our model
const Task = mongoose.model("Task", TaskSchema);

// winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "task-manager" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// If not in production, then log to the `console`
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Mongoose connection events
mongoose.connection.on("error", (err) => {
  logger.error(`Mongoose connection error: ${err}`);
});

// When the connection is disconnected
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.error(
    "Mongoose default connection disconnected through app termination"
  );
  process.exit(0);
});

// Routes

/**
 * A root route that returns "hello world"
 */
app.get("/", (req, res) => {
  res.send("hello world");
});

/**
 * Gets all tasks that are not completed
 */
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({ completed: false });
    res.json(tasks);
  } catch (err) {
    logger.error(err);
    res.status(500).send({ message: err.message });
  }
});

/**
 * Posts a new task
 */
app.post("/api/tasks", async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed,
    });
    res.json(task);
  } catch (err) {
    logger.error(err);
    res.status(500).send({ message: err.message });
  }
});

/**
 * Updates a task by id
 */
app.put("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).send({ error: "Invalid Task ID" });
  }
  try {
    const task = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(task);
  } catch (err) {
    logger.error(err);
    res.status(500).send({ message: err.message });
  }
});

/**
 * Deletes a task by id
 */
app.delete("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).send({ error: "Invalid Task ID" });
  }

  try {
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).send({ error: "Task not found" });
    }

    res.status(200).send({ message: "Task deleted successfully" });
  } catch (err) {
    logger.error(err);
    res.status(500).send({ message: err.message });
  }
});

/**
 * Starts the local server
 */
app.listen(process.env.PORT || 3000, () => {
  logger.log("info", `server is running on port ${process.env.PORT}`);
});
