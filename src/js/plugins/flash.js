/**
 * Plugin that handles closing the flash messages.
 */
(function() {
    window.ESS_PLUGINS = window.ESS_PLUGINS || {};
    let plugins = window.ESS_PLUGINS;
    plugins.flash = function() {
        let flash = document.querySelector('.flash');
        if (flash) {
            function setup_message(message) {
                if (!message.getAttribute('data-action-close-message')) {
                    message.addEventListener('click', function() {
                        message.parentElement.remove();
                        if (list.children.length == 0) {
                            flash.remove();
                        }
                    });
                }
                message.setAttribute('data-action-close-message', 'true');
            }

            let list = flash.querySelector('ul');
            let messages = flash.querySelectorAll('[data-action="close-message"]');
            for (let idx = 0; idx < messages.length; idx++) {
                setup_message(messages[idx]);
            }
        }
    };

    plugins.flash();
})();
