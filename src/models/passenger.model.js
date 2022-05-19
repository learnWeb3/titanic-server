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

PassengerSchema.statics.survivalProbability = async function (
  data = { sex: "male", ageMax: 40, ageMin: 30, class: 3 }
) {
  const { sex, ageMax, ageMin, class: pClass } = data;
  const totalPassengers = await this.count({
    sex,
    class: pClass,
    age: {
      $gte: ageMin,
      $lte: ageMax,
    },
  });
  const passengersCount = await this.count({
    sex,
    class: pClass,
    age: {
      $gte: ageMin,
      $lte: ageMax,
    },
    survived: true,
  });

  return {
    survival: passengersCount / totalPassengers,
  };
};

module.exports = model("Passenger", PassengerSchema);
