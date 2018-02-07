import Component from "../Component";

// HELPERS
import Meerkat from "../../Meerkat";
import * as utils from "../../utils/utils";


export const Frame = class Frame extends Component {
    // Properties
    get page() {
        const pageElement = this.element.querySelector(`[data-mk-component="Page"].active`);
        return pageElement ? Meerkat.getComponentByUid(pageElement.getAttribute("data-mk-uid")) : null;
    }

    // Methods
    navigate(props) {
        if(typeof props === "string") props = { path: props };
        const previousPage = this.page;
        let moduleDOM;

        utils.createDefaultsForObject({
            path: null,
            animated: true,
            transition: { name: "fade", duration: 300 },
            saveHistory: true
        }, props);

        let loadedPage = null;
        Object.keys(_loadedPagesByUid).forEach(uid => {
            if(_loadedPagesByUid[uid].props.path === props.path) loadedPage = _loadedPagesByUid[uid];
        });

        if(!loadedPage) {
            try {
                moduleDOM = require(`@app/${props.path}.xml`);
            } catch(e) {
                console.error(`Could not find module "${props.path}".`);
                return;
            }

            const pageTag = utils.substringBetweenChars(moduleDOM, moduleDOM.indexOf("Page"), "<", ">");
            const animationClass = props.animated === true ? `display-on-top transition-${props.transition.name}-in` : "";
            const newPageTag = `${pageTag} path="${props.path}" active="true" class="${animationClass}"`;
            moduleDOM = moduleDOM.replace(pageTag, newPageTag);
            
            if(props.animated === true) {
                previousPage.element.classList.add("display");
                previousPage.element.classList.add(`transition-${props.transition.name}-out`);
                setTimeout(() => {
                    if(props.saveHistory === true) {
                        previousPage.element.classList.remove("display");
                        previousPage.element.classList.remove(`transition-${props.transition.name}-out`);
                    } else {
                        delete _loadedPagesByUid[previousPage.uid];
                        Meerkat.unmountComponent(previousPage);
                    }
                }, props.transition.duration);
            }
            previousPage.element.classList.remove("active");

            Meerkat.appendDOMToComponent(moduleDOM, this);
            const page = this.page;
            _loadedPagesByUid[page.uid] = page;
            
            if(props.animated === true) {
                setTimeout(() => {
                    page.element.classList.remove("display-on-top");
                    page.element.classList.remove(`transition-${props.transition.name}-in`);
                }, props.transition.duration);
            }
        } else if(!loadedPage.element.classList.contains("active")) {
            if(props.animated === true) {
                previousPage.element.classList.add("display");
                previousPage.element.classList.add(`transition-${props.transition.name}-out`);
                loadedPage.element.classList.add("display-on-top");
                loadedPage.element.classList.add(`transition-${props.transition.name}-in`);
                setTimeout(() => {
                    previousPage.element.classList.remove("display");
                    previousPage.element.classList.remove(`transition-${props.transition.name}-out`);
                    loadedPage.element.classList.remove("display-on-top");
                    loadedPage.element.classList.remove(`transition-${props.transition.name}-in`);
                }, props.transition.duration);
            }
            previousPage.element.classList.remove("active");
            loadedPage.element.classList.add("active");
        }
    }

    componentWillMount() {
        const page = this.page;
        _loadedPagesByUid[page.uid] = page;
    }

    render(content) {
        const loadedPage = _loadPage.call(this, this.props.page);

        return (`
            <div>${loadedPage}</div>
        `);
    }
};

export default Frame;


// PRIVATE FUNCTIONS
function _loadPage(pagePath) {
    try {
        if(typeof pagePath === "undefined") throw `"pagePath" is not defined.`;
        if(typeof pagePath !== "string") throw `"pagePath" must be of type String.`;

        let moduleDOM = require(`@app/${pagePath}.xml`);
        const pageTag = utils.substringBetweenChars(moduleDOM, moduleDOM.indexOf("Page"), "<", ">");
        const newPageTag = `${pageTag} path="${pagePath}" active="true"`;
        moduleDOM = moduleDOM.replace(pageTag, newPageTag);
        
        return moduleDOM;
    } catch(e) {
        console.error(e);
    }
}


// PRIVATE DATA
const _loadedPagesByUid = {};