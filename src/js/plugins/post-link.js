/**
 * Plugin that posts the URL of a link, instead of the default GET action.
 */
(function() {
    function setup_anchor(anchor) {
        if (!anchor.getAttribute('data-action-post-link')) {
            anchor.addEventListener('click', function(ev) {
                ev.preventDefault();
                if(anchor.getAttribute('data-confirm-prompt')) {
                    if(confirm(anchor.getAttribute('data-confirm-prompt'))) {
                        let form = document.createElement('form');
                        form.setAttribute('action', anchor.getAttribute('href'));
                        form.setAttribute('method', 'post');
                        if (anchor.getAttribute('data-csrf-token')) {
                            let token = document.createElement('input');
                            token.setAttribute('type', 'hidden');
                            token.setAttribute('name', 'csrf_token');
                            token.setAttribute('value', anchor.getAttribute('data-csrf-token'));
                            form.append(token);
                        }
                        anchor.append(form);
                        form.submit();
                    }
                } else {
                    let form = document.createElement('form');
                    form.setAttribute('action', anchor.getAttribute('href'));
                    form.setAttribute('method', 'post');
                    if (anchor.getAttribute('data-csrf-token')) {
                        let token = document.createElement('input');
                        token.setAttribute('type', 'hidden');
                        token.setAttribute('name', 'csrf_token');
                        token.setAttribute('value', anchor.getAttribute('data-csrf-token'));
                        form.append(token);
                    }
                    anchor.append(form);
                    form.submit();
                }
            });
            anchor.setAttribute('data-action-post-link', 'true');
        }
    }

    window.ESS_PLUGINS = window.ESS_PLUGINS || {};
    let plugins = window.ESS_PLUGINS;
    plugins.postLink = function() {
        let anchors = document.querySelectorAll('a[data-action="post-link"]');
        for(let idx = 0; idx < anchors.length; idx++) {
            setup_anchor(anchors[idx]);
        }
    };

    plugins.postLink();
})();
