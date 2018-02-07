// MODULES
import Observable from "@meerkat/data/Observable";
import ObservableArray from "@meerkat/data/ObservableArray";

let page, viewModel, createViewModel = () => new Observable({
    pageTitle: "Tab 1",
    items: new ObservableArray([
        { title: "Photo 1", description: "Description...", imageURL: "app/assets/img/photo_01.jpg" },
        { title: "Photo 2", description: "Description...", imageURL: "app/assets/img/photo_02.jpg" }
    ])
});

export const onMounted = function(args) {
    page = args.object;
    page.bindingContext = viewModel = createViewModel();
};

export const refreshApp = function(args) {
    window.location.reload();
};