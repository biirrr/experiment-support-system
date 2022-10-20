<script lang='ts'>
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { EditorState } from '@codemirror/state';
    import { EditorView, keymap, lineNumbers } from '@codemirror/view';
    import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';

    let container = null as HTMLElement;
    let editor = null as EditorView;
    export let value = '';
    let oldValue = null;

    onMount(() => {
        const state = EditorState.create({
            doc: value,
            extensions: [
                lineNumbers(),
                history(),
                keymap.of(defaultKeymap),
                keymap.of(historyKeymap),
                EditorView.updateListener.of(update => {
                    if(update.docChanged) {
                        value = editor.state.doc.toString();
                        oldValue = value;
                    }
                }),
            ],
        });

        editor = new EditorView({
            state: state,
            parent: container,
        });
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
            editor = null;
        }
    });

    $: {
        if (value !== oldValue && editor) {
            const state = EditorState.create({
                doc: value,
                extensions: [
                    lineNumbers(),
                    history(),
                    keymap.of(defaultKeymap),
                    keymap.of(historyKeymap),
                    EditorView.updateListener.of(update => {
                        if(update.docChanged) {
                            value = editor.state.doc.toString();
                            oldValue = value;
                        }
                    }),
                ],
            });

            editor.setState(state);
        }
    }
</script>

<div bind:this={container} class="h-full w-full"></div>

<style global>
    .cm-editor {
        @apply h-full;
    }
    .ͼ1.ͼ2.cm-editor.cm-focused {
        @apply rounded outline outline-2 outline-primary;
    }
    .cm-editor .cm-content {
        @apply bg-gray-200 rounded-r;
    }
    .cm-editor .cm-gutters {
        @apply rounded-l;
    }
    .cm-editor .cm-scroller {
        @apply overflow-y-auto;
    }
</style>
