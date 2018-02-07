import "@meerkat/meerkat.scss";
import "./components/registerComponentClasses";

// MODULES
import Meerkat from "@meerkat/Meerkat";


const props = {
    id: "MeerkatApp",
    disableNavBar: false,
    page: "pages/start/start"
};

Meerkat.renderDOM(`
    <App id="${props.id}" disableNavBar="${props.disableNavBar}" page="${props.page}" />
`, document.querySelector("#root"));