// MODULES
import _exprEval from "expr-eval";


/**
 * getClosestElementByQuery: Get the closest matching element up the DOM tree.
 */
export const getClosestElementByQuery = function(elem, selector) {
    if(!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

    if(elem.parentNode) elem = elem.parentNode;

    for(; elem && elem !== document; elem = elem.parentNode) {
        if(elem.matches && elem.matches(selector)) return elem;
    }

    return null;
};


/**
 * isType: Check if value corresponts a specific class type.
 */
export const isType = function(value, type) {
    return value !== null ? (typeof value !== "undefined" && value.constructor.toString().indexOf(type) >= 0) : false;
};

/**
 * rotateArray: Rotate elements in an array.
 */
export const rotateArray = function(arr, reverse) {
    if(reverse) {
        arr.unshift(arr.pop());
    } else {
        arr.push(arr.shift());
    }
    return arr;
};


/**
 * createDefaultsForObject: Create default values for an object.
 */
export const createDefaultsForObject = function(defaults, original) {
	start();
    function start(def = defaults, val = original) {
        for(let key in val)	if(isType(val[key], "Object")) start(def[key], val[key]);
        if(def) for(let key in def) if(!val.hasOwnProperty(key)) val[key] = def[key];
    }
}


/**
 * substringBetweenChars: Substring between two characters.
 */
export const substringBetweenChars = function(string, index, charFirst, charLast, includeChars = false) {
	if(index >= 0 && index < string.length) {
    	includeChars = includeChars === true;
        const stringStart = string.substring(index, string.lastIndexOf(charFirst, index) + (!includeChars ? 1 : 0));
        const stringEnd = string.substring(index, string.indexOf(charLast, index) + (includeChars ? 1 : 0));
        
        return stringStart + stringEnd;
    } else {
	    return null;
    }
}


/**
 * evalWithContext: Evaluate an expression with an object of context.
 */
export const evalWithContext = function(expression, context) {
    try {
        return _exprEval.Parser.evaluate(expression, context);
    } catch(e) {
        // console.error(e);
    }
};


/**
 * Convert string to its actual type.
 */
export const stringToType = function(string) {
    try {
  	    return JSON.parse(string);
    } catch(e) {
        return string;
    }
};


export const createClassName = function(initialClassName = "", conditionals = {}) {
    let conditionalClassName = "";
    Object.keys(conditionals).forEach(className => {
        if(!!conditionals[className]) conditionalClassName += " " + className;
    });

    return initialClassName + (initialClassName ? conditionalClassName : conditionalClassName.substring(1));
};


/**
 * base64: Base64 encoder and decoder.
 */
export const base64 = {
    encode: string => btoa(string),
    decode: base64String => {
        return atob(base64String);
        // return decodeURIComponent(Array.prototype.map.call(atob(base64String), c => 
        //     "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
        // );
    }
}
Object.freeze(base64);


export const decodeHTMLEntities = function(html) {
    const tempEl = document.createElement("textarea");
    tempEl.innerHTML = html;
    return tempEl.value;
}


/**
 * 
 * @param {*} props
 * 
 * waitForAddedNode({
 *     id: 'message',
 *     parent: document.querySelector('.container'),
 *     recursive: false
 * }).then(element => console.log(element));
 */
export const waitForAddedNode = function(props) {
    return new Promise((resolve, reject) => {
        new MutationObserver(function(mutations) {
            const element = document.getElementById(props.id);
            if(element) {
                this.disconnect();
                resolve(element);
            }
        }).observe(props.parent || document, {
            subtree: !!props.recursive,
            childList: true
        });
    });
};