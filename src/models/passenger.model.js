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

module.exports = model("Passenger", PassengerSchema);
