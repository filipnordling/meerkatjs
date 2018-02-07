// MODULES
import Observable from "@meerkat/data/Observable";


export const ObservableArray = class ObservableArray extends Observable {
    constructor(array = []) {
        super();
        _init.call(this, array);
    }

    // Properties
    get length() { return this._array.length; }

    // Methods
    getItem(index) { return this._array[index]; }
    setItem(index, value) {
        this.notify("change", null, { index: index, value: value });
        return this._array[index] = value;
    }
    
    indexOf(item) { return this._array.indexOf(item); }
    forEach(callbackFn) { return this._array.forEach(callbackFn); }
    filter(callbackFn) { return this._array.filter(callbackFn); }
    map(callbackFn) { return this._array.map(callbackFn); }
    
    push(value) {
        const returnValue = this._array.push(value);
        this.notifyPropertyChange("length", this.length);
        this.notify("push", null, { item: value });
        this.notify("change");
        return returnValue;
    }

    splice() {
        const returnValue = this._array.splice.apply(this._array, arguments);
        this.notifyPropertyChange("length", this.length);
        this.notify("splice", null, { deletedItems: returnValue, startIndex: arguments[0] });
        this.notify("change");
        return returnValue;
    }
};

export default ObservableArray;


// INTERNAL FUNCTIONS
function _init(array) {
    this._array = array;
}