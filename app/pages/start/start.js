// MODULES
import Observable from "@meerkat/data/Observable";
import ObservableArray from "@meerkat/data/ObservableArray";

export const goTab1 = function(args) {
    const frame = args.object.page.frames[0];
    frame.navigate("pages/tabs/tab1/tab1");
};

export const goTab2 = function(args) {
    const frame = args.object.page.frames[0];
    frame.navigate("pages/tabs/tab2/tab2");
};

export const goTestPage = function(args) {
    const frame = args.object.page.frames[0];
    frame.navigate("pages/test/test");
};