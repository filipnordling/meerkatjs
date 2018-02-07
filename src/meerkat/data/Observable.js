// HELPERS
import * as utils from "@meerkat/utils/utils";


export default class Observable {
    constructor(props = {}) {
        _init.call(this, props);
    }

    // Properties


    // Methods
    get(propertyName) {
        return this[propertyName];
    }

    set(propertyName, value) {
        if(this[propertyName] !== value) {
            this.notifyPropertyChange(propertyName, this[propertyName] = value);
        }
        return value;
    }

    on(eventName, callbackFn) {
        if(!this._observeCallbacks[eventName]) this._observeCallbacks[eventName] = [];
        this._observeCallbacks[eventName].push(callbackFn);
    }

    off(eventName, callbackFn) {
        if(this._observeCallbacks[eventName]) {
            if(callbackFn) {
                const callbackIndex = this._observeCallbacks[eventName].indexOf(callbackFn);
                if(callbackIndex >= 0) this._observeCallbacks[eventName].splice(callbackIndex, 1);
            } else {
                delete this._observeCallbacks[eventName];
            }
        } else {
            console.error(new Error(`eventName "${eventName}" doesn't exist.`));
        }
    }

    notify(eventName, nativeEvent, props) {
        props = props || {};
        const events = this._observeCallbacks[eventName];

        if(!props.eventName) props.eventName = eventName;
        if(!props.object) props.object = this;
        if(nativeEvent && !props.nativeEvent) props.nativeEvent = nativeEvent;

        if(events && events.length > 0) {
            events.forEach(e => e(props));
            // events[0](props);
            // utils.rotateArray(events);
        }
    }

    notifyPropertyChange(propertyName, value) {
        _refreshWatchers.call(this);
        this.notify("propertyChange", null, { propertyName: propertyName, value: value });
    }
    
    removeElementFromWatcher(element) {
        this._watchers.forEach((watcher, index) => {
            if(watcher.type === "element" && element.contains(watcher.object)) {
                this._watchers.splice(index, 1);
            }
        });
    }
}


// INTERNAL FUNCTIONS
function _init(props) {
    for(let key in props) this[key] = props[key];
    this._observeCallbacks = {};
    this._watchers = [];
}

function _refreshWatchers() {
    const context = this;
    const watchers = this._watchers;

    watchers.forEach(watcher => {
        if(watcher.type === "element") {
            refreshElement(watcher.object);
        }
    });

    // Refresh functions
    function refreshElement(element) {
        const bindData = JSON.parse(utils.base64.decode(element.getAttribute("data-mk-bind")));

        Object.keys(bindData).forEach(attrName => {
            const expression = bindData[attrName];
            
            if(attrName === "content") {
                element.innerHTML = utils.evalWithContext(expression, context);
            } else {
                element.setAttribute(attrName, utils.evalWithContext(expression, context));
            }
        });
    }
}