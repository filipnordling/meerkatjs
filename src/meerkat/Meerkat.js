// HELPERS
import Component from "@meerkat/components/Component";
import * as utils from "@meerkat/utils/utils";


const Meerkat = {};

/**
 * renderDOM: Render a DOM structure and append to a container element.
 */
Meerkat.renderDOM = function(dom, containerElement) {
    const convertedHTML = _domToHtml(dom);
    
    containerElement.innerHTML = convertedHTML.html;
    convertedHTML.components.forEach(component => _componentsByUid[component.uid] = component);
    convertedHTML.components.forEach(component => {
        _handleBindedComponentProps(component);

        if(component.componentWillMount) {
            if(typeof component.componentWillMount.then === "function") {
                component.componentWillMount().then(() => _mountComponent(component));
            } else {
                component.componentWillMount();
                _mountComponent(component);
            }
        } else {
            _mountComponent(component);
        }
    });
};


Meerkat.appendDOMToComponent = function(dom, component, query) {
    const containerElement = query ? component.element.querySelector(query) : component.element;
    const convertedHTML = _domToHtml(dom);
    const parsedElement = _parseHTML(convertedHTML.html);
    
    containerElement.appendChild(parsedElement);
    convertedHTML.components.forEach(component => _componentsByUid[component.uid] = component);
    convertedHTML.components.forEach(component => {
        _handleBindedComponentProps(component);

        if(component.componentWillMount) {
            if(typeof component.componentWillMount.then === "function") {
                component.componentWillMount().then(() => _mountComponent(component));
            } else {
                component.componentWillMount();
                _mountComponent(component);
            }
        } else {
            _mountComponent(component);
        }
    });
};

Meerkat.unmountComponent = function(ref) {
    const component = typeof ref === "string" ? Meerkat.getComponentByUid(ref) : ref;
    const uid = typeof ref !== "string" ? component.uid : ref;

    if(component.componentWillUnmount) component.componentWillUnmount();
    if(component.bindingContext) component.bindingContext.removeElementFromWatcher(component.element);
    
    component.element.parentNode.removeChild(component.element);
    delete _componentsByUid[uid];
    delete _mountedComponentsByUid[uid];

    if(component.componentDidUnmount) component.componentDidUnmount();
    component.notify("unmounted", null);
};

Meerkat.getComponentByUid = function(uid) {
    return _componentsByUid[uid] || null;
};

Meerkat.isMounted = function(component) {
    return !!_mountedComponentsByUid[component.uid];
};

/**
 * getComponentClass: Register a component class to the global DOM registry.
 */
Meerkat.getComponentClass = function(componentName) {
    if(_registeredComponentClasses[componentName]) {
        return _registeredComponentClasses[componentName];
    } else {
        console.error(`"${componentName}" is not a registered component.`);
    }
};

/**
 * registerComponentClass: Register a component class to the global DOM registry.
 */
Meerkat.registerComponentClass = function(componentAlias, componentClass) {
    if(!_registeredComponentClasses[componentAlias]) {
        _registeredComponentClasses[componentAlias] = { class: componentClass };
    } else {
        console.error(`"${componentAlias}" is already a registered component.`);
    }
};

export default Meerkat;


export const _parseHTML = function(html) {
    const tempEl = document.createElement("div");
    tempEl.innerHTML = html;
    return tempEl.firstElementChild;
};

export const _createDOMDocument = function(dom, xmlDocument = false) {
    let tempDoc;

    if(xmlDocument === true) {
        tempDoc = (new DOMParser()).parseFromString(`<root>${dom}</root>`, "text/xml").documentElement;
    } else {
        tempDoc = document.createElement("div");
        tempDoc.innerHTML = dom;
    }

    _preventSelfEnclosingTags(tempDoc);
    return tempDoc;
};

export const _domToHtml = function(dom) {
    let containerElement = _createDOMDocument(dom, true);
    const registeredDOMTags = Object.keys(_registeredComponentClasses).join(", ");
    const components = [];
    let element;

    while(element !== null) {
        if(element = containerElement.querySelector(registeredDOMTags)) {
            _checkSubComponents(element);
            const componentProps = _createComponentFromElement(element);
            
            element.parentNode.replaceChild(componentProps.element, element);
            components.push(componentProps.component);
        }
    }
    
    _handleBindings(containerElement);
    let html = containerElement.firstElementChild.outerHTML.replace(/\[\[__empty__\]\]/g, "");

    return { components, html };
};

export const _checkSubComponents = function(element) {
    let result = element.innerHTML;
    const matches = result.match(/\<[/ ]?[a-zA-Z]*\.[a-zA-Z]*[ />]*/g);

    if(matches) {
        matches.forEach(match => {
            const matchSplit = match.split(".");
            const replacement = matchSplit[0] + matchSplit[1].substring(0, 1).toUpperCase() + matchSplit[1].substring(1);
            result = result.replace(new RegExp(_escapeRegExp(match), "g"), replacement);
        });

        element.innerHTML = result;
    }
};

export const _handleBindings = function(srcElement) {
    let html = srcElement.innerHTML;

    let attributeMatch;
    while(attributeMatch !== null) {
        if(attributeMatch = html.match(/(\S+)=["']?({{([^}]+)}})["']?/)) {
            const wholeTag = utils.substringBetweenChars(html, attributeMatch.index, "<", ">", true);
            const newWholeTag = utils.substringBetweenChars(
                _handleBindAttributes(_createDOMDocument(wholeTag).firstElementChild).outerHTML
            , 0, "<", ">", true);

            html = html.replace(new RegExp(_escapeRegExp(wholeTag), "g"), newWholeTag);
        }
    }

    let contentMatch;
    while(contentMatch !== null) {
        if(contentMatch = html.match(/{{([^}]+)}}/)) {
            if(html.substr(contentMatch.index-2, 2) !== '="') {
                const expression = utils.decodeHTMLEntities(contentMatch[0].replace(/(^\{\{([ ]*))|(([ ]*\}\})$)/g, ""));
                const spanEl = document.createElement("span");

                spanEl.innerHTML = "";
                spanEl.setAttribute("data-mk-bind", utils.base64.encode(JSON.stringify({ content: expression })));

                html = html.replace(new RegExp(_escapeRegExp(contentMatch[0]), "g"), spanEl.outerHTML);
            }
        }
    }

    srcElement.innerHTML = html;
}

export const _handleBindAttributes = function(element) {
    const bindData = {};

    for(let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i].nodeName;
        const value = element.attributes[i].value;

        if(value.substring(0, 2) === "{{") {
            const expression = utils.decodeHTMLEntities(value.replace(/(^\{\{([ ]*))|(([ ]*\}\})$)/g, ""));
            bindData[attr] = expression;
            element.setAttribute(attr, "");
            // element.removeAttribute(attr);
            // element.setAttribute(attr, expression);
        }
    }

    if(element.hasAttribute("data-mk-bind")) {
        const oldBindData = JSON.parse(element.getAttribute("data-mk-bind"));
        Object.keys(oldBindData).forEach(key => bindData[key] = oldBindData[key]);
    }

    element.setAttribute("data-mk-bind", utils.base64.encode(JSON.stringify(bindData)));
    return element;
};

export const _handleBindedComponentProps = function(component) {
    const props = component.props;
    const context = component.bindingContext;

    Object.keys(props).forEach(key => {
        if(typeof props[key] === "string" && props[key].substring(0, 2) === "{{") {
            const expression = component._bindedProps[key] = props[key].replace(/(^\{\{([ ]*))|(([ ]*\}\})$)/g, "");
            component.props[key] = utils.evalWithContext(expression, context);
        }
    });
};

export const _preventSelfEnclosingTags = function(srcElement) {
    const elements = srcElement.querySelectorAll("*");
    
    for(let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if(element.innerHTML === "") element.innerHTML = "[[__empty__]]";
    }
};

export const _createComponentFromElement = function(srcElement) {
    const srcProps = (() => {
        const result = {};
        for(let i = 0; i < srcElement.attributes.length; i++) {
            const attr = srcElement.attributes[i];
            result[attr.nodeName] = utils.stringToType(attr.value);
        }
        return result;
    })();
    const componentName = srcElement.nodeName;
    const componentProps = _registeredComponentClasses[componentName];
    const ComponentClass = componentProps.class;
    const component = new ComponentClass(srcProps);
    const componentElement = _createDOMDocument(component.render(srcElement.innerHTML), true).firstElementChild;
    
    if(srcProps.id) componentElement.setAttribute("id", srcProps.id);
    componentElement.setAttribute("data-mk-component", componentName);
    componentElement.setAttribute("data-mk-uid", component.uid);

    return { component, element: componentElement };
};

export const _escapeRegExp = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

// export const _eachComponents = function(fn) {
//     const components = Object.keys(_componentsByUid).map(uid => _componentsByUid[uid]);
//     components.forEach(fn);
// };

export const _mountComponent = function(component) {
    Object.keys(component.props).forEach(propertyName => {
        const value = component.props[propertyName];
        const el = component.element;
        if(typeof el[propertyName] !== "undefined") el[propertyName] = value;
    });

    _mountedComponentsByUid[component.uid] = component;
    if(component.componentDidMount) component.componentDidMount();
    component.notify("mounted", null);

    Component.refreshBindings(component, false);
};


// INTERNAL DATA
const _registeredComponentClasses = {};

const _componentsByUid = {};
const _mountedComponentsByUid = {};


// REGISTER COMPONENTS
Meerkat.registerComponentClass("Button", require("@meerkat/components/Button/Button").Button);
Meerkat.registerComponentClass("Frame", require("@meerkat/components/Frame/Frame").Frame);
Meerkat.registerComponentClass("LoadingIndicator", require("@meerkat/components/LoadingIndicator/LoadingIndicator").LoadingIndicator);
Meerkat.registerComponentClass("NavBar", require("@meerkat/components/NavBar/NavBar").NavBar);
Meerkat.registerComponentClass("NavBarItem", require("@meerkat/components/NavBar/NavBar").NavBarItem);
Meerkat.registerComponentClass("Page", require("@meerkat/components/Page/Page").Page);
Meerkat.registerComponentClass("Repeater", require("@meerkat/components/Repeater/Repeater").Repeater);
Meerkat.registerComponentClass("RepeaterItemTemplate", require("@meerkat/components/Repeater/Repeater").RepeaterItemTemplate);
Meerkat.registerComponentClass("ScrollView", require("@meerkat/components/ScrollView/ScrollView").ScrollView);
Meerkat.registerComponentClass("TabBar", require("@meerkat/components/TabBar/TabBar").TabBar);
Meerkat.registerComponentClass("TabBarItem", require("@meerkat/components/TabBar/TabBar").TabBarItem);

Meerkat.registerComponentClass("StackLayout", require("@meerkat/components/layouts/StackLayout/StackLayout").StackLayout);
Meerkat.registerComponentClass("AbsoluteLayout", require("@meerkat/components/layouts/AbsoluteLayout/AbsoluteLayout").AbsoluteLayout);