<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    let element = null as HTMLElement;
    let focused = false;
    let controls = null as NodeListOf<Element>;
    export let vertical = false;

    function focus(ev: FocusEvent) {
        focused = true;
        for (let control of controls) {
            control.setAttribute('tabindex', control === ev.target ? '0' : '-1')
        }
    }

    function blur(ev: FocusEvent) {
        focused = false;
    }

    function keydown(ev: KeyboardEvent) {
        if ((!vertical && ev.key === 'ArrowRight') || (vertical && ev.key === 'ArrowDown')) {
            ev.preventDefault();
            ev.stopPropagation();
        } else if ((!vertical && ev.key === 'ArrowLeft') || (vertical && ev.key === 'ArrowUp')) {
            ev.preventDefault();
            ev.stopPropagation();
        } else if (ev.key === 'Home') {
            ev.preventDefault();
            ev.stopPropagation();
        } else if (ev.key === 'End') {
            ev.preventDefault();
            ev.stopPropagation();
        }
    }

    function keyup(ev: KeyboardEvent) {
        const focused = element.querySelector(':focus');
        if ((!vertical && ev.key === 'ArrowRight') || (vertical && ev.key === 'ArrowDown')) {
            ev.preventDefault();
            ev.stopPropagation();
            let found = false;
            for (let control of controls) {
                if (control === focused) {
                    found = true;
                } else if (found) {
                    (control as HTMLElement).focus();
                    break;
                }
            }
        } else if ((!vertical && ev.key === 'ArrowLeft') || (vertical && ev.key === 'ArrowUp')) {
            ev.preventDefault();
            ev.stopPropagation();
            let last = null as HTMLElement;
            for (let control of controls) {
                if (control === focused) {
                    if (last) {
                        last.focus();
                        break
                    }
                }
                last = control as HTMLElement;
            }
        } else if (ev.key === 'Home') {
            ev.preventDefault();
            ev.stopPropagation();
            (controls[0] as HTMLElement).focus();
        } else if (ev.key === 'End') {
            ev.preventDefault();
            ev.stopPropagation();
            (controls[controls.length - 1] as HTMLElement).focus();
        }
    }

    onMount(() => {
        controls = element.querySelectorAll('button, a');
        let first = true;
        for (let control of controls) {
            control.addEventListener('focus', focus);
            control.addEventListener('blur', blur);
            if (first) {
                first = false;
                control.setAttribute('tabindex', '0');
            } else {
                control.setAttribute('tabindex', '-1');
            }
        }
    });

    onDestroy(() => {
        for (let control of controls) {
            control.removeEventListener('focus', focus);
            control.removeEventListener('blur', blur);
        }
    });
</script>

<div bind:this={element} on:keydown={keydown} on:keyup={keyup} role="toolbar" class="{focused ? 'outline outline-2 outline-primary rounded' : ''} p-1 mb-4" aria-orientation="{vertical ? 'vertical' : 'horizontal'}">
    <slot></slot>
</div>
