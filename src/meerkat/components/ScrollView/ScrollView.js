import Component from "../Component";

// HELPERS
import * as utils from "../../utils/utils";


export const ScrollView = class ScrollView extends Component {
    // Properties


    // Methods
    componentWillMount() {
        _checkScrollable(this.element);
    }

    render(content) {
        const classes = utils.createClassName("", {
            "vertical": this.props.orientation !== "horizontal",
            "horizontal": this.props.orientation === "horizontal"
        });

        return (`
            <div class="${classes}">${content}</div>
        `);
    }
};

export default ScrollView;


// PRIVATE FUNCTIONS
function _checkScrollable(element) {
    element.addEventListener("touchstart", () => {
        const top = element.scrollTop;
        const totalScroll = element.scrollHeight;
        const currentScroll = top + element.offsetHeight;

        if(top === 0) {
            element.scrollTop = 1;
        } else if(currentScroll === totalScroll) {
            element.scrollTop = top - 1;
        }
    });
}