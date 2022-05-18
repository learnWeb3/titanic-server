const express = require("express");
const { authorizeQueryParams, validateQueryParams } = require("../middlewares");
const Analysis = require("../models/analysis.model");
const Passenger = require("../models/passenger.model");
const { validateStatsType } = require("../validators");

const passengersRouter = express.Router();

passengersRouter.get("/", authorizeQueryParams(), async (req, res, next) => {
  try {
    const passengers = await Passenger.findAll();
    res.status(200).json(passengers);
  } catch (error) {
    next(error);
  }
});

passengersRouter.get(
  "/stats",
  authorizeQueryParams({
    type: true,
  }),
  validateQueryParams({
    type: validateStatsType,
  }),
  async (req, res, next) => {
    try {
      const { type } = req.query;
      const analysis = await Analysis.find();
      if (type) {
        res.status(200).json(analysis[0][type]);
      } else {
        res.status(200).json(analysis[0]);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = passengersRouter;
