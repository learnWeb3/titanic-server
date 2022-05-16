const { cwd } = process;
const { join } = require("path");

const isProd = process.env.NODE_ENV === "production";
require("dotenv").config({
  path: join(process.cwd(), isProd ? ".env.production" : ".env.development"),
});

// ENVIRONNEMENT VARIABLES
const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

const mongoose = require("mongoose");
const { readFileSync } = require("fs");
const Seeder = require("../services/Seeder");

const DBURI = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
mongoose.connect(DBURI).then((connexion) => {
  const Passenger = require("../models/passenger.model");
  const passengersData = readFileSync(
    join(cwd(), "src", "services", "Seeder", "assets", "passengers.json")
  ).toString("utf8");
  let passengersDataArr = JSON.parse(passengersData).map(
    ({
      PassengerId,
      Survived,
      Pclass,
      Name,
      Sex,
      Age,
      SibSp,
      Parch,
      Ticket,
      Fare,
      Cabin,
      Embarked,
    }) => ({
      passengerId: +PassengerId,
      survived: +Survived,
      class: +Pclass,
      name: Name,
      sex: Sex,
      age: +Age,
      sibSp: +SibSp,
      parch: +Parch,
      ticket: Ticket,
      fare: +Fare,
      cabin: Cabin,
      embarked: Embarked,
    })
  );
  const seeder = new Seeder(Passenger, passengersDataArr);
  seeder
    .seed()
    .then(({ registeredPassengers, errorsPassengers }) => {
      console.log(`seed passengers data completed with success`);
      console.log(
        `seed stats: errorsCount ${errorsPassengers.length}, registeredCount: ${registeredPassengers.length} `
      );
      process.exit(0)
    })
    .catch((error) => `error while seeding passengers data`);
});
