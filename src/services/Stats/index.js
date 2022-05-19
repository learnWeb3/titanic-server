const { compare } = require("bcrypt");
const { standardDeviation, mean, max } = require("simple-statistics");

module.exports = class Stats {
  constructor(passengerModel) {
    this._passengerModel = passengerModel;
  }


  async passengerClasses() {
    return await this._passengerModel.aggregate([
      {
        $group: { _id: "$class", count: { $sum: 1 } },
      },
      {
        $project: {
          _id: 0,
          class: "$_id",
          count: 1,
        },
      },
      {
        $sort: {
          class: 1,
        },
      },
    ]);
  }

  async passengerAges() {
    return await this._passengerModel.aggregate([
      {
        $group: { _id: "$age", count: { $sum: 1 } },
      },
      {
        $project: {
          _id: 0,
          age: "$_id",
          count: 1,
        },
      },
      {
        $sort: {
          age: 1,
        },
      },
    ]);
  }

  async passengerGenders() {
    return await this._passengerModel.aggregate([
      {
        $group: { _id: "$sex", count: { $sum: 1 } },
      },
      {
        $project: {
          _id: 0,
          sex: "$_id",
          count: 1,
        },
      },
      {
        $sort: {
          sex: 1,
        },
      },
    ]);
  }

  async genderAnalysis(passengersSexes = []) {
    const sexesAnalytics = {
      passengerRepartition: passengersSexes,
      deathRepartition: null,
      agesDistribution: {
        died: null,
        survived: null,
      },
    };
    for (const passengerSex of passengersSexes) {
      const aggregate = await this._passengerModel.aggregate([
        { $match: { sex: passengerSex.sex } },
        {
          $group: { _id: "$survived", count: { $sum: 1 } },
        },
        {
          $project: {
            _id: 0,
            survived: "$_id",
            count: 1,
          },
        },
        {
          $sort: {
            survived: 1,
          },
        },
      ]);

      sexesAnalytics.deathRepartition = {
        ...sexesAnalytics.deathRepartition,
        [passengerSex.sex]: aggregate,
      };
      sexesAnalytics.agesDistribution = {
        died: {
          ...sexesAnalytics.agesDistribution.died,
          [passengerSex.sex]: await this._ageDistribution({
            age: {
              $gte: 1,
            },
            survived: false,
            sex: passengerSex.sex,
          }),
        },
        survived: {
          ...sexesAnalytics.agesDistribution.survived,
          [passengerSex.sex]: await this._ageDistribution({
            age: {
              $gte: 1,
            },
            survived: true,
            sex: passengerSex.sex,
          }),
        },
      };
    }

    return sexesAnalytics;
  }

  async classesAnalysis(passengerClasses) {
    const classesAnalysis = {
      passengerRepartition: passengerClasses,
      deathRepartition: null,
      genderRepartition: null,
      agesDistribution: {
        died: null,
        survived: null,
      },
    };
    for (const passengerClass of passengerClasses) {
      const aggregateDeath = await this._passengerModel.aggregate([
        {
          $match: { class: passengerClass.class },
        },
        {
          $group: { _id: "$survived", count: { $sum: 1 } },
        },
        {
          $project: {
            _id: 0,
            survived: "$_id",
            count: 1,
          },
        },
        {
          $sort: {
            survived: 1,
          },
        },
      ]);

      const aggregateGender = await this._passengerModel.aggregate([
        {
          $match: { class: passengerClass.class },
        },
        {
          $group: { _id: "$sex", count: { $sum: 1 } },
        },
        {
          $project: {
            _id: 0,
            sex: "$_id",
            count: 1,
          },
        },
        {
          $sort: {
            sex: 1,
          },
        },
      ]);
      classesAnalysis.deathRepartition = {
        ...classesAnalysis.deathRepartition,
        [passengerClass.class]: aggregateDeath,
      };
      classesAnalysis.genderRepartition = {
        ...classesAnalysis.genderRepartition,
        [passengerClass.class]: aggregateGender,
      };
      classesAnalysis.agesDistribution = {
        died: {
          ...classesAnalysis.agesDistribution.died,
          [passengerClass.class]: await this._ageDistribution({
            age: {
              $gte: 1,
            },
            survived: false,
            class: passengerClass.class,
          }),
        },
        survived: {
          ...classesAnalysis.agesDistribution.survived,
          [passengerClass.class]: await this._ageDistribution({
            age: {
              $gte: 1,
            },
            survived: true,
            class: passengerClass.class,
          }),
        },
      };
    }
    return classesAnalysis;
  }

  async _ageDistribution(filterOptions = {}) {
    const aggregate = await this._passengerModel.aggregate([
      {
        $match: { ...filterOptions },
      },
      {
        $group: { _id: "$age", count: { $sum: 1 } },
      },
      {
        $project: {
          _id: false,
          age: "$_id",
          count: true,
        },
      },
      {
        $sort: {
          age: 1,
        },
      },
    ]);

    const ages = aggregate.map((element) => element.age);
    const stdDeviation = standardDeviation(ages);
    const _mean = mean(ages);
    const _maxCount = aggregate.reduce((max, element)=>element.count > max ? element.count : max , 0);

    // create slices using standardDeviations to plots count from -3stdDeviation to +3 stdDeviation

    return {
      data: aggregate,
      stdDeviation: stdDeviation,
      min: aggregate[0].age,
      max: aggregate[aggregate.length - 1].age,
      mean: _mean,
      maxCount: _maxCount
    };
  }
};
