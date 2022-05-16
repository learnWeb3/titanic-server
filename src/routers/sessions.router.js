const filter = require("content-filter");
const express = require("express");
const {
  filterOptions,
  authorizeBodyParams,
  requireBodyParams,
  validateBodyParams,
} = require("../middlewares/index.js");
const User = require("../models/user.model");
const { validateEmail, validatePassword } = require("../validators/index.js");

const sessionsRouter = new express.Router();

sessionsRouter.post(
  "/",
  filter(filterOptions),
  authorizeBodyParams({
    email: true,
    password: true,
  }),
  requireBodyParams({
    email: true,
    password: true,
  }),
  validateBodyParams({
    email: validateEmail,
    password: validatePassword,
  }),
  async (req, res, next) => {
    try {
      const { body } = req;
      const token = await User.login(body);
      res.status(200).json(token);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = sessionsRouter;
