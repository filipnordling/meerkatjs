import Component from "../Component";

// HELPERS
import * as utils from "../../utils/utils";


export const LoadingIndicator = class LoadingIndicator extends Component {
    // constructor() {
    //     super();
    // }

    // Properties


    // Methods
    componentDidMount() {
        // if(this.props.busy) {
        //     this.addTimeout(() => {
        //         this.setState({ busy: true });
        //     }, 300);
        // }
    }

    render(content) {
        const classes = utils.createClassName("", {
            "active": this.props.busy
        });

        return (`
            <div class="${classes}">
                <svg class="spinner" width="48px" height="48px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                    <circle class="path" fill="none" stroke-width="4" stroke-linecap="round" cx="32" cy="32" r="28"></circle>
                </svg>
            </div>
        `);
    }
};

export default LoadingIndicator;