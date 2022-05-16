const { cwd } = process;
const {join} = require("path");

const isProd = process.env.NODE_ENV === "production";
require("dotenv").config({
  path: join(process.cwd(), isProd ? ".env.production" : ".env.development"),
});

// ENVIRONNEMENT VARIABLES
const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  JWT_SECRET,
  SERVER_HOST,
  SERVER_PORT,
} = process.env;

const mongoose = require("mongoose");
const express = require("express");
const{ expressjwt:jwt} = require("express-jwt");
const cors = require("cors");
const usersRouter = require("./src/routers/users.router");
const sessionsRouter = require("./src/routers/sessions.router");
const { errorHandler } = require("./src/middlewares");
const passengersRouter = require("./src/routers/passengers.router");

const app = express();
const DBURI = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
mongoose
  .connect(DBURI)
  .then((connexion) => {
    // middlewares

    app.use("public", express.static(join(cwd(), "public")));

    app.use(
      cors({
        origin: "*",
        optionsSuccessStatus: 200,
      })
    );

    app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    app.use(
      express.json({
        limit: "50mb",
      })
    );

    app.use(
      jwt({
        secret: JWT_SECRET,
        algorithms: ["HS256"],
      }).unless({
        path: ["/sessions", "/users"],
      })
    );

    // ROUTERS
    app.use("/users", usersRouter);
    app.use("/sessions", sessionsRouter);
    app.use('/passengers', passengersRouter)

    // ERROR HANDLING 
    app.use(errorHandler)

    app.listen(SERVER_PORT, SERVER_HOST, () => {
      console.log(`server running at: http://${SERVER_HOST}:${SERVER_PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
