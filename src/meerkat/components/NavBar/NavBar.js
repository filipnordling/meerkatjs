import Component from "../Component";

// HELPERS
import * as utils from "../../utils/utils";


/**
 * NavBar: The main NavBar component.
 */
export const NavBar = class NavBar extends Component {
    // constructor() {
    //     super();
    // }

    // Properties


    // Methods
    componentWillMount() {
        this.page.element.classList.add("has-navbar");
    }

    render(content) {
        const classes = utils.createClassName("", {
            "disabled": this.props.disabled,
            "border": this.props.border,
            "shadow": this.props.shadow
        });

        return (`
            <header class="${classes}">${content}</header>
        `);
    }
};

export default NavBar;

/**
 * NavBarItem: The Item component for NavBar.
 */
export const NavBarItem = class NavBarItem extends Component {
    // constructor() {
    //     super();
    // }

    // Properties


    // Methods
    // componentDidMount() {
        
    // }

    componentWillMount() {
        _setupExportEvents.call(this);
    }
    
    render(content) {
        const classes = utils.createClassName("item", {
            "icon": !!this.props.icon,
            "text": !!this.props.text,
            "title": this.props.isTitle,
            "clickable": !!this.props.click
        });
        const innerHTML = (this.props.icon ?
            `<i class="icon material-icons">${this.props.icon}</i>` :
            `<span class="text">${this.props.text}</span>`
        );

        return (`
            <div class="${classes}">${innerHTML}</div>
        `);
    }
};


// INTERNAL FUNCTIONS
function _setupExportEvents() {
    if(this.props.click) Component.setEventProperty(this, { propertyName: "click", eventName: "click" });
}