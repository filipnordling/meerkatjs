// MODULES
import Meerkat from "@meerkat/Meerkat";
import Observable from "@meerkat/data/Observable";
import Component from "@meerkat/components/Component";

// HELPERS
import * as utils from "@meerkat/utils/utils";


export const App = class App extends Component {
    // constructor(props) {
    //     super(props);
    // }

    // Methods
    componentDidMount() {
        console.log(`[${this.props.id}] Application has been loaded.`);
    }

    componentWillMount() {
        console.log(`[${this.props.id}] Loading application...`);
    }
    
    render(content) {
        const classes = utils.createClassName("", {
            "disable-navBar": this.props.disableNavBar
        });

        return (`
            <div class="${classes}">
                <Frame page="${this.props.page}" />
            </div>
        `);
    }
};

export default App;