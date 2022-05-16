const express = require("express");
const filter = require("content-filter");
const {
  filterOptions,
  authorizeBodyParams,
  requireBodyParams,
  validateBodyParams,
} = require("../middlewares/index.js");
const { validateEmail, validatePassword } = require("../validators/index.js");
const User = require("../models/user.model.js");

const usersRouter = new express.Router();

usersRouter.get("/", async (req, res, next) => {});

usersRouter.post(
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
      const newUser = await User.register(body);
      res.status(200).json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = usersRouter;
