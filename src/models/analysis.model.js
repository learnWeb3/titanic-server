const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { Number, Mixed } = Schema.Types;

const AnalysisSchema = new Schema(
  {
    count: Number,
    ages: Mixed,
    classes: Mixed,
    sexes: Mixed,
  },
  {
    toJSON: { virtuals: true },
    toObject: { getters: true, virtuals: true },
    timestamps: true,
  }
);

module.exports = model("Analysis", AnalysisSchema);
