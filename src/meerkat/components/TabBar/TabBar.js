import Component from "../Component";

// HELPERS
import * as utils from "../../utils/utils";


export const TabBar = class TabBar extends Component {
    // Properties


    // Methods
    // componentDidMount() {
    //     console.log(this.page);
    // }

    render(content) {
        const classes = utils.createClassName("", {
            "border": this.props.border,
            "shadow": this.props.shadow
        });

        return (`
            <div class="${classes}">${content}</div>
        `);
    }
};

export default TabBar;

export const TabBarItem = class TabBarItem extends Component {
    // Properties


    // Methods
    componentWillMount() {
        _setupExportEvents.call(this);
    }

    render(content) {
        const classes = utils.createClassName("item", {
            "icon": !!this.props.icon,
            "text": !!this.props.text,
            "clickable": !!this.props.click
        });
        const iconHTML = this.props.icon ? `<div class="icon material-icons">${this.props.icon}</div>` : "";
        const textHTML = this.props.text ? `<div class="text">${this.props.text}</div>` : "";

        return (`
            <div class="${classes}">
                ${iconHTML}
                ${textHTML}
            </div>
        `);
    }
};


// INTERNAL FUNCTIONS
function _setupExportEvents() {
    if(this.props.click) Component.setEventProperty(this, { propertyName: "click", eventName: "click" });
}