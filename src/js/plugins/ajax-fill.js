/**
 * Plugin that handles filling parts of the page via ajax.
 */
(function() {
    function fetchData(ajaxFiller) {
        window.fetch(ajaxFiller.getAttribute('data-ajax-fill')).then((response) => {
            response.text().then((data) => {
                ajaxFiller.removeAttribute('data-ajax-fill');
                ajaxFiller.innerHTML = data;
                plugins.imagePopup();
            });
        });
    }

    window.ESS_PLUGINS = window.ESS_PLUGINS || {};
    let plugins = window.ESS_PLUGINS;
    plugins.ajaxFill = function() {
        const ajaxFillers = document.querySelectorAll('[data-ajax-fill]');
        if (ajaxFillers) {
            for (let idx = 0; idx < ajaxFillers.length; idx++) {
                const ajaxFill = ajaxFillers[idx];
            }
        }
    };

    plugins.ajaxFill();
})();
