import Component from "../../Component";

// HELPERS
import * as utils from "../../../utils/utils";


export const StackLayout = class StackLayout extends Component {
    // Properties


    // Methods
    // componentDidMount() {
        
    // }

    render(content) {
        const classes = utils.createClassName("", {
            "horizontal": this.props.orientation !== "vertical",
            "vertical": this.props.orientation === "vertical",
            "left": this.props.horizontalAlign === "left",
            "right": this.props.horizontalAlign === "right",
            "top": this.props.verticalAlign === "top",
            "bottom": this.props.verticalAlign === "bottom",
            "wrap-content": !!this.props.wrapContent
        });

        return (`
            <div class="${classes}">${content}</div>
        `);
    }
};

export default StackLayout;