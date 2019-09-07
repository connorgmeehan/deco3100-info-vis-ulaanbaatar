// define a class
class Observable {
    // each instance of the Observer class
    // starts with an empty array of things (observers)
    // that react to a state change
    constructor(data = null) {
      this.data = data;
      this.observers = [];
    }

    // add the ability to subscribe to a new object / DOM element
    // essentially, add something to the observers array
    subscribe(f) {
      this.observers.push(f);
    }

    // add the ability to unsubscribe from a particular object
    // essentially, remove something from the observers array
    unsubscribe(f) {
      this.observers = this.observers.filter(subscriber => subscriber !== f);
    }

    // update all subscribed objects / DOM elements
    // and pass some data to each of them
    notify(data) {
      this.data = data;
      this.observers.forEach(observer => observer(data));
    }
}

const NewAppState = {
    scrollUTC: new Observable(),
    scrollTemperature: new Observable(),
    selectedUTC: new Observable(),
    selectedPollution: new Observable(),
    selectedStation: new Observable(),
    selectedTemperature: new Observable(),
};

export default NewAppState;