import Component from "../Component";
import ObservableArray from "../../data/ObservableArray";
import Meerkat, { _createDOMDocument } from "../../Meerkat";

// HELPERS
import * as utils from "../../utils/utils";


export const Repeater = class Repeater extends Component {
    constructor(props) {
        super(props);
    }

    // Properties
    get items() { return this.props.items; }

    // Methods
    // componentDidMount() {

    // }

    componentWillMount() {
        const items = this.items;
        
        items.forEach((item, index) => _onitemTemplatePush.call(this, item, index));
        items.on("push", args => _onitemTemplatePush.call(this, args.item, items.indexOf(args.item)));
        items.on("splice", args => _onitemTemplateSplice.call(this, args.deletedItems, args.startIndex));
    }

    render(content) {
        const classes = utils.createClassName(this.props.class || "", );
        this._itemTemplateHTML = content;

        return (`
            <div class="${classes}"></div>
        `);
    }
};

export default Repeater;


export const RepeaterItemTemplate = class RepeaterItemTemplate extends Component {
    constructor(props) {
        super(props);

        // this.bindingContext = props.;
    }

    // Properties


    // Methods
    componentWillMount() {
        this.bindingContext = this.parent.items.getItem(this.props.itemIndex);
    }

    render(content) {
        return content;
    }
};


// INTERNAL FUNCTIONS
function _onitemTemplatePush(item, index) {
    const itemTemplateElement = _createDOMDocument(this._itemTemplateHTML, true).firstElementChild;

    itemTemplateElement.setAttribute("itemIndex", index);
    Meerkat.appendDOMToComponent(itemTemplateElement.outerHTML, this);
}

function _onitemTemplateSplice(deletedItems, startIndex) {
    for(let i = 0; i < deletedItems.length; i++) {
        const itemTemplateElement = this.element.children[i];
        Meerkat.unmountComponent(itemTemplateElement.getAttribute("data-mk-uid"));
    }

}