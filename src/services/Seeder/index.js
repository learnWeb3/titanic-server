class Seeder {
  constructor(passengerModel, passengersData) {
    this.passengerModel = passengerModel;
    this.passengersData = passengersData;
  }
  async clear(){
    return await this.passengerModel.collection.drop()
  }
  async seed() {
    const registeredPassengers = [];
    const errorsPassengers = [];
    for (const passengerData of this.passengersData) {
      try {
        const newPassenger = new this.passengerModel({
          ...passengerData,
        });
        const registeredPassenger = await newPassenger.save();
        console.log(`Passenger ${registeredPassenger.name} registered !`);
        registeredPassengers.push(registeredPassenger);
      } catch (error) {
        console.log(error);
        errorsPassengers.push(passengerData);
      }
    }

    return {
      registeredPassengers,
      errorsPassengers,
    };
  }
}

module.exports = Seeder;
