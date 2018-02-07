import Component from "../../Component";

// HELPERS
import * as utils from "../../../utils/utils";


export const AbsoluteLayout = class AbsoluteLayout extends Component {
    // Properties


    // Methods
    // componentDidMount() {
        
    // }

    render(content) {
        return (`
            <div>${content}</div>
        `);
    }
};

export default AbsoluteLayout;