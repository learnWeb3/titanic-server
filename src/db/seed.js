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
const Stats = require("../services/Stats");

const DBURI = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
mongoose.connect(DBURI).then(async (connexion) => {
  const Passenger = require("../models/passenger.model");
  const Analysis = require("../models/analysis.model");
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
  await Passenger.collection.drop();
  await Analysis.collection.drop();
  const seeder = new Seeder(Passenger, passengersDataArr);
  await seeder
    .seed()
    .then(async ({ registeredPassengers, errorsPassengers }) => {
      console.log(`seed passengers data completed with success`);
      console.log(
        `seed stats: errorsCount ${errorsPassengers.length}, registeredCount: ${registeredPassengers.length} `
      );
      const STAT = new Stats(Passenger);

      const passengerCount = await Passenger.count();
      const passengersSexes = await STAT.passengerGenders();
      const passengersClasses = await STAT.passengerClasses();

      const ageDistribution = await STAT._ageDistribution({});
      const sexes = await STAT.genderAnalysis(passengersSexes);
      const classes = await STAT.classesAnalysis(passengersClasses);

      const newAnalysis = new Analysis({
        count: passengerCount,
        ages: {
          ageDistribution,
        },
        classes,
        sexes,
      });

      await newAnalysis.save();

      console.log(`analysis registered with success`);

      process.exit(0);
    })
    .catch((error) =>
      console.log(`error while seeding passengers data`, error)
    );
});
