import Meerkat from "@meerkat/Meerkat";
import Observable from "@meerkat/data/Observable";

// HELPERS
import * as utils from "@meerkat/utils/utils";

/**
 * Component: The main Component class.
 * @param {*} props 
 */
export const Component = class Component extends Observable {
    constructor(props) {
        super();
        _init.call(this, props);
    }

    // Properties
    get typeName() { return this.constructor.name; }
    get uid() { return this._uid; }
    get props() { return this._props || null; }
    get element() { return document.querySelector(`[data-mk-uid="${this.uid}"]`); }
    get events() { return this._events; }
    get isMounted() { return Meerkat.isMounted(this); }

    get id() { return this.element.id }
    set id(value) { this.element.id = value; }

    get bindingContext() { return this._bindingContext || (this.parent ? this.parent.bindingContext : null) || null; }
    set bindingContext(value) {
        if(utils.isType(value, "Object") || utils.isType(value, "Observable")) {
            this._bindingContext = value;
        } else {
            console.error(`Value of "bindingContext" must be of type Object or Observable. ${value.constructor.name} given.`);
        }
    }

    get parent() {
        try {
            const parent = utils.getClosestElementByQuery(this.element, `[data-mk-component]`);
            return parent ? Meerkat.getComponentByUid(parent.getAttribute("data-mk-uid")) : null;
        } catch(e) { return null; }
    }

    get children() {
        const result = [];
        const descendants = this.element.querySelectorAll(`[data-mk-component]`);
        for(let i = 0; i < descendants.length; i++) {
            const descendant = descendants[i];
            const parent = utils.getClosestElementByQuery(descendant, `[data-mk-component]`);
            if(parent && parent === this.element) {
                result.push(Meerkat.getComponentByUid(descendant.getAttribute("data-mk-uid")));
            }
        }
        return result;
    }

    get page() {
        const page = utils.getClosestElementByQuery(this.element, `[data-mk-component="Page"]`);
        return page ? Meerkat.getComponentByUid(page.getAttribute("data-mk-uid")) : null;
    }

    // Methods
    getComponentById(id) {
        let result = null;
        const componentElement = this.element.querySelector(`#${id}[data-mk-component]`);
        return componentElement ? Meerkat.getComponentByUid(componentElement.getAttribute("data-mk-uid")) : null;
    }

    getComponentsByTypeName(typeName) {
        const result = [];
        const descendants = this.element.querySelectorAll(`[data-mk-component="${typeName}"]`);
        for(let i = 0; i < descendants.length; i++) {
            result.push(Meerkat.getComponentByUid(descendants[i].getAttribute("data-mk-uid")));
        }
        return result;
    }

    on(eventName, callback) {
        super.on(eventName, callback);

        if(eventName === "click" || eventName === "tap") {
            this.events.add("click", eventName, this.clickElement);
        }
    }

    off(eventName, callback) {
        super.off(eventName, callback);

        const observeCallbacks = this._observeCallbacks[eventName];
        
        if(observeCallbacks) {
            const callbackIndex = observeCallbacks.indexOf(callback);

            if(callbackIndex >= 0) observeCallbacks.splice(callbackIndex, 1);
            if(observeCallbacks.length === 0) delete this._observeCallbacks[eventName];
        }

        if(eventName === "click" || eventName === "tap") {
            if(observeCallbacks.length === 0) this.events.remove("click", eventName, this.clickElement);
        }
    }

    addTimeout(handler, timeout, uid) {
        this._timeoutHandlers[uid || _createUid()] = setTimeout(handler, timeout || 0);
    }

    addInterval(handler, timeout, uid) {
        this._intervalHandlers[uid || _createUid()] = setInterval(handler, timeout || 0);
    }

    clearTimeouts() {
        Object.keys(this._timeoutHandlers).forEach(key => clearTimeout(this._timeoutHandlers[key]));
    }

    clearIntervals() {
        Object.keys(this._intervalHandlers).forEach(key => clearInterval(this._intervalHandlers[key]));
    }

    // Static methods
    static setEventProperty(component, props) {
        const callbackName = component.props[props.eventName];
        const eventElement = props.element || component.element;
        const page = utils.isType(component, "Page") ? component : component.page;
        const callback = page.exports[callbackName];
        if(callback) component.on(props.eventName, callback);
    }

    static refreshBindings(component, reset = true) {
        const bindingContext = component.bindingContext;

        // Binded props
        const bindedProps = component._bindedProps;
        Object.keys(bindedProps).forEach(key => {
            component.props[key] = utils.evalWithContext(bindedProps[key], bindingContext);
            component.notify("bindedPropertyChange", null, { propertyName: key, value: component.props[key] });
        });
        
        // Elements
        const elements = component.element.querySelectorAll("[data-mk-bind]");
        if(reset === true && utils.isType(bindingContext, "Observable")) bindingContext._watchers.length = 0;
        for(let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const closestComponentElement = utils.getClosestElementByQuery(element, `[data-mk-component]`);
            const closestComponentUid = closestComponentElement && closestComponentElement.getAttribute("data-mk-uid");
    
            if(closestComponentUid === component.uid) {
                if(bindingContext) {
                    if(utils.isType(bindingContext, "Observable")) {
                        bindingContext._watchers.push({ type: "element", object: element });
                    }
                    
                    // Refresh bindings
                    const bindData = JSON.parse(utils.base64.decode(element.getAttribute("data-mk-bind")));
                    Object.keys(bindData).forEach(attrName => {
                        const expression = bindData[attrName];
                        if(attrName === "content") {
                            element.innerHTML = utils.evalWithContext(expression, bindingContext);
                        } else {
                            element.setAttribute(attrName, utils.evalWithContext(expression, bindingContext));
                        }
                    });
                }
            }
        }
    }
};

export default Component;


export const ComponentEvents = class ComponentEvents {
    constructor(ownerUid) {
        this._ownerUid = ownerUid;
        this._handlersByType = {};
        this._eventNamesByType = {};
    }

    // Properties


    // Methods
    add(type, name, element, returnArgsFn) {
        const typeExists = !!this._handlersByType[type];
        const owner = Meerkat.getComponentByUid(this._ownerUid);
        element = element || owner.element;

        if(!typeExists) {
            element.addEventListener(type, this._handlersByType[type] = e => {
                this._eventNamesByType[type].forEach(n => {
                    owner.notify(name, e, returnArgsFn ? returnArgsFn(e) : null);
                });
            });
        }

        if(!this._eventNamesByType[type]) this._eventNamesByType[type] = [];
        this._eventNamesByType[type].push(name);
    }

    remove(name, type, element) {
        const typeExists = !!this._handlersByType[type];
        const owner = Meerkat.getComponentByUid(this._ownerUid);
        element = element || owner.element;

        if(typeExists) {
            element.removeEventListener(type, this._handlersByType[type]);
        } else {
            console.error(`There are no events for "${name}" to remove.`);
        }
    }
}


// INTERNAL FUNCTIONS
function _init(props) {
    this._props = props;
    this._timeoutHandlers = {};
    this._intervalHandlers = {};
    this._uid = _createUid();
    this._events = new ComponentEvents(this.uid);
    this._bindedProps = {};
}

function _willUnmount() {
    // Clear timeouts and intervals
    this.clearTimeouts();
    this.clearIntervals();
}

function _createUid(prefix, length = 10) {
    let result = (prefix || "") + "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(let i = 0; i < length; i++) result += possible.charAt(Math.floor(Math.random() * possible.length));
    return result;
}