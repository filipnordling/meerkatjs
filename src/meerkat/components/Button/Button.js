import Component from "../Component";

// HELPERS
import Meerkat from "../../Meerkat";
import * as utils from "../../utils/utils";


export const Button = class Button extends Component {
    // Properties
    get busy() { return this.element.classList.contains("busy"); }
    set busy(value) {
        const loadingIndicatorElement = this.element.querySelector(`[data-mk-component="LoadingIndicator"]`);
        loadingIndicatorElement.classList[value === true ? "add" : "remove"]("active");
        this.element.classList[value === true ? "add" : "remove"]("busy");
        // const loadingIndicator = Meerkat.getComponentByUid(loadingIndicatorElement.getAttribute("data-mk-uid"));
        // loadingIndicator.busy = 
    }

    get label() { return this.element.querySelector(".label").textContent; }
    set label(value) { this.element.querySelector(".label").textContent = value; }

    // Methods


    componentWillMount() {
        _setupExportEvents.call(this);

        if(this.props.busy) this.busy = !!this.props.busy;
    }

    render(content) {
        const classes = utils.createClassName(this.props.class || "", {
            "primary": !!this.props.primary,
            "busy": !!this.props.busy
        });

        return (`
            <button type="button" class="${classes}">
                <LoadingIndicator busy="${!!this.props.busy}" />
                <div class="label">${this.props.label}</div>
            </button>
        `);
    }
};

export default Button;


// PRIVATE FUNCTIONS
function _setupExportEvents() {
    if(this.props.click) Component.setEventProperty(this, { propertyName: "click", eventName: "click" });
}