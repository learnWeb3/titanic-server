const { standardDeviation, mean } = require("simple-statistics");

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
    const sexesAnalytics = {};
    for (const passengerSex of passengersSexes) {
      const aggregate = await this._passengerModel.aggregate([
        {
          $match: { sex: passengerSex.sex },
        },
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

      const formattedAggregate = aggregate.reduce((mappingObj, row) => {
        mappingObj[row.class] = {
          count: row.count,
          survival: {},
        };
        return mappingObj;
      }, {});

      sexesAnalytics[passengerSex.sex] = {
        count: passengerSex.count,
        classes: formattedAggregate,
        ageDistribution: await this._ageDistribution({
          sex: passengerSex.sex,
        }),
      };

      for (const passengerClass of aggregate) {
        const aggregate = await this._passengerModel.aggregate([
          { $match: { sex: passengerSex.sex, class: passengerClass.class } },
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

        const formattedAggregate = {};

        for (const aggregateItem of aggregate) {
          formattedAggregate[aggregateItem.survived ? "survived" : "died"] = {
            count: aggregateItem.count,
            ageDistribution: await this._ageDistribution({
              sex: passengerSex.sex,
              class: passengerClass.class,
              survived: aggregateItem.survived,
            }),
          };
        }

        sexesAnalytics[passengerSex.sex].classes[
          passengerClass.class
        ].survival = formattedAggregate;

        sexesAnalytics[passengerSex.sex].classes[
          passengerClass.class
        ].ageDistribution = await this._ageDistribution({
          sex: passengerSex.sex,
          class: passengerClass.class,
        });
      }
    }

    return sexesAnalytics;
  }

  async classesAnalysis(passengerClasses) {
    const classesAnalysis = {};
    for (const passengerClass of passengerClasses) {
      const aggregate = await this._passengerModel.aggregate([
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
      const formattedAggregate = aggregate.reduce((mappingObj, row) => {
        mappingObj[row.sex] = {
          count: row.count,
        };
        return mappingObj;
      }, {});
      classesAnalysis[passengerClass.class] = {
        count: passengerClass.count,
        sexes: formattedAggregate,
        ageDistribution: await this._ageDistribution({
          class: passengerClass.class,
        }),
      };

      for (const passengerSex of aggregate) {
        const aggregate = await this._passengerModel.aggregate([
          {
            $match: { sex: passengerSex.sex, class: passengerClass.class },
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

        const formattedAggregate = {};
        for (const aggregateItem of aggregate) {
          formattedAggregate[aggregateItem.survived ? "survived" : "died"] = {
            count: aggregateItem.count,
            ageDistribution: await this._ageDistribution({
              survived: aggregateItem.survived,
              class: passengerClass.class,
              sex: passengerSex.sex,
            }),
          };
        }

        classesAnalysis[passengerClass.class].sexes[passengerSex.sex].survival =
          formattedAggregate;

        classesAnalysis[passengerClass.class].sexes[
          passengerSex.sex
        ].ageDistribution = await this._ageDistribution({
          class: passengerClass.class,
          sex: passengerSex.sex,
        });
      }
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

    return {
      data: aggregate,
      stdDeviation: stdDeviation,
      min: aggregate[0].age,
      max: aggregate[aggregate.length - 1].age,
      mean: _mean,
    };
  }
};
