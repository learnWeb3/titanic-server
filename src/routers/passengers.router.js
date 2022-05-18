const express = require("express");
const Analysis = require("../models/analysis.model");
const Passenger = require("../models/passenger.model");

const passengersRouter = express.Router();

passengersRouter.get("/", async (req, res, next) => {
  try {
    const passengers = await Passenger.findAll();
    res.status(200).json(passengers);
  } catch (error) {
    next(error);
  }
});

passengersRouter.get("/stats", async (req, res, next) => {
  try {
    const analysis = await Analysis.find();
    res.status(200).json(analysis);
  } catch (error) {
    next(error);
  }
});

module.exports = passengersRouter;
