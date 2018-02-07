// MODULES
import Observable from "@meerkat/data/Observable";
import ObservableArray from "@meerkat/data/ObservableArray";

let page, viewModel, createViewModel = () => new Observable({
    pageTitle: "Test",
    bodyText: (`
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sagittis vel risus sed auctor. Cras sit amet dapibus mi, vitae malesuada dui. Duis placerat varius ipsum, sed condimentum diam hendrerit eu. Quisque eget augue non tortor finibus ultricies vel at nunc. Integer iaculis semper elit eu interdum. Ut vitae consequat neque. Curabitur imperdiet elit id nibh tincidunt, ut euismod velit condimentum.</p>

        <p>Vestibulum tempor, augue et efficitur sodales, nisl orci cursus nisi, id mollis dui neque eu massa. Donec aliquet est felis, vitae tincidunt metus sagittis non. Proin id sagittis enim. Nunc sollicitudin in ipsum scelerisque iaculis.</p>
    `)
});

export const onMounted = function(args) {
    page = args.object;
    page.bindingContext = viewModel = createViewModel();
};

export const cancel = function(args) {
    args.object.busy = !args.object.busy;
    setTimeout(() => {
        window.location.reload();
    }, 1500);
};

export const proceed = function(args) {
    args.object.busy = !args.object.busy;
};