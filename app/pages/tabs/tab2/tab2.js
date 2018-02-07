// MODULES
import Observable from "@meerkat/data/Observable";
import ObservableArray from "@meerkat/data/ObservableArray";

let page, viewModel, createViewModel = () => new Observable({
    pageTitle: "Settings",
    items: new ObservableArray([
        { test: "Tab 2" }
    ])
});

export const onMounted = function(args) {
    page = args.object;
    page.bindingContext = viewModel = createViewModel();
};

export const navBarItemClick = function(args) {

};

export const navBarItemClick2 = function(args) {

};