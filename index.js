'use strict'
const express = require('express');
const app = express();

const PORT = 3000;

// route
app.get("/",(req, res)=>{
  res.send("hello world")
})

// app listen


app.listen(PORT);