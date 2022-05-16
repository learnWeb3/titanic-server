const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { Number, String, ObjectId, Boolean } = Schema.Types;

const PassengerSchema = new Schema(
  {
    passengerId: {
      type: Number,
      required: true,
    },
    survived: {
      type: Boolean,
      required: true,
    },
    class: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sex: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    sibSp: {
      type: Number,
      required: true,
    },
    parch: {
      type: Number,
      required: true,
    },
    ticket: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    cabin: {
      type: String,
      required: false,
    },
    embarked: {
      type: String,
      required: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { getters: true, virtuals: true },
    timestamps: true,
  }
);

PassengerSchema.statics.findAll = async function () {
  return await this.find({});
};

PassengerSchema.statics.mainStats = async function () {
  const passengers = await this.find({});
  const passengersClasses = await this.find().distinct("class");
  const passengerClassesPassengerRepartition = passengersClasses.reduce(
    (mappingObj, passengerClass) => {
      mappingObj[passengerClass] = {
        passengers: [],
        survivedPassengers: [],
        diedPassengers: [],
      };
      return mappingObj;
    },
    {}
  );
  // ages
  let sumAge = 0;
  let minAge = 0;
  let maxAge = 0;
  let sumAgeSurvived = 0;
  let minAgeSurvived = 0;
  let maxAgeSurvived = 0;
  let sumAgeDied = 0;
  let minAgeDied = 0;
  let maxAgeDied = 0;

  const diedPassengers = [];
  const survivedPassengers = [];

  const males = {
    died: [],
    survived: [],
    all: [],
  };
  const females = {
    died: [],
    survived: [],
    all: [],
  };
  for (const passenger of passengers) {
    // survived
    if (passenger.survived) {
      survivedPassengers.push(passenger);
    } else {
      diedPassengers.push(passenger);
    }

    // ages
    sumAge += passenger.age;
    if (minAge === 0) {
      minAge = passenger.age;
    }
    if (passenger.age < minAge) {
      minAge = passenger.age;
    }
    if (maxAge === 0) {
      maxAge = passenger.age;
    }
    if (passenger.age > maxAge) {
      maxAge = passenger.age;
    }

    // ages
    if (passenger.survived) {
      sumAgeSurvived += passenger.age;
      if (minAgeSurvived === 0) {
        minAgeSurvived = passenger.age;
      }
      if (passenger.age < minAgeSurvived) {
        minAgeSurvived = passenger.age;
      }
      if (maxAgeSurvived === 0) {
        maxAgeSurvived = passenger.age;
      }
      if (passenger.age > maxAgeSurvived) {
        maxAgeSurvived = passenger.age;
      }
    } else {
      sumAgeDied += passenger.age;
      if (minAgeDied === 0) {
        minAgeDied = passenger.age;
      }
      if (passenger.age < minAgeDied) {
        minAgeDied = passenger.age;
      }
      if (maxAgeDied === 0) {
        maxAgeDied = passenger.age;
      }
      if (passenger.age > maxAgeDied) {
        maxAgeDied = passenger.age;
      }
    }

    // sex
    if (passenger.sex === "male") {
      if (passenger.survived) {
        males.survived.push(passenger);
      } else {
        males.died.push(passenger);
      }
      males.all.push(passenger);
    } else {
      if (passenger.survived) {
        females.survived.push(passenger);
      } else {
        females.died.push(passenger);
      }
      females.all.push(passenger);
    }

    // passengers repartition in classes and death
    passengerClassesPassengerRepartition[passenger.class].passengers = [
      ...passengerClassesPassengerRepartition[passenger.class].passengers,
      passenger,
    ];

    if (passenger.survived) {
      passengerClassesPassengerRepartition[passenger.class].survivedPassengers =
        [
          ...passengerClassesPassengerRepartition[passenger.class]
            .survivedPassengers,
          passenger,
        ];
    } else {
      passengerClassesPassengerRepartition[passenger.class].diedPassengers = [
        ...passengerClassesPassengerRepartition[passenger.class].diedPassengers,
        passenger,
      ];
    }
  }

  // ages
  const passengersCount = passengers.length;
  let meanAge = sumAge / passengersCount;
  let meanAgeDied = sumAgeDied / diedPassengers.length;
  let meanAgeSurvived = sumAgeSurvived / survivedPassengers.length;

  return {
    passengers,
    passengersCount,
    diedPassengers,
    survivedPassengers,
    age: {
      allPassengers: {
        minAge,
        maxAge,
        meanAge,
      },
      diedPassengers: {
        minAge: minAgeDied,
        maxAge: maxAgeDied,
        meanAge: meanAgeDied,
      },
      survivedPassengers: {
        minAge: minAgeSurvived,
        maxAge: maxAgeSurvived,
        meanAge: meanAgeSurvived,
      },
    },
    class: {
      passengersClasses,
      passengerClassesPassengerRepartition,
    },
    sex: {
      males,
      females,
    },
  };
};

module.exports = model("Passenger", PassengerSchema);
