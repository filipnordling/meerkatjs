import Component from "../Component";


// HELPERS
import Meerkat from "../../Meerkat";
import * as utils from "../../utils/utils";


export const Page = class Page extends Component {
    // constructor(props) {
    //     super(props);
    // }
    
    // Properties
    get frame() {
        const result = utils.getClosestElementByQuery(this.element, `[data-mk-component="Frame"]`);
        return result ? Meerkat.getComponentByUid(result.getAttribute("data-mk-uid")) : null;
    }

    get frames() {
        const result = [];
        const frameElements = this.element.querySelectorAll(`[data-mk-component="Frame"]`);

        for(let i = 0; i < frameElements.length; i++) {
            result.push(Meerkat.getComponentByUid(frameElements[i].getAttribute("data-mk-uid")));
        }

        return result;
    }

    get exports() { return this._exports || null; }
    set exports(value) { this._exports = value; }

    // Methods
    getComponentByQuery(query) {
        const element = this.element.querySelector(query);
        return element ? Meerkat.getComponentByUid(element.getAttribute("data-mk-uid")) : null;
    }

    componentWillMount() {
        if(this.props.path) {
            const pagePath = this.props.path;
            const pageExports = this.exports = require(`@app/${pagePath}.js`);
        }

        // if(this.exports) _setupExportEvents.call(this);
        _setupExportEvents.call(this);
    }

    render(content) {
        const classes = utils.createClassName(this.props.class || "", {
            "active": this.props.active
        });

        return (`
            <div class="${classes}">${content}</div>
        `);
    }
};

export default Page;


// INTERNAL FUNCTIONS
function _setupExportEvents() {
    if(this.props.mounted) Component.setEventProperty(this, { eventName: "mounted" });
    if(this.props.unmounted) Component.setEventProperty(this, { eventName: "unmounted" });
}