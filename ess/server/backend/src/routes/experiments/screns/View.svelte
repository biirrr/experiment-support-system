<script lang="ts">
    import { fade } from 'svelte/transition';
    import { derived } from 'svelte/store';
    import { useParams } from 'svelte-navigator';
    import { marked } from 'marked';

    import { fetch, experiment } from '../../../stores';
    import { CodeEditor, Input, Button, Icon, Toolbar } from '../../../components';

    const params = useParams();
    let code = '';
    let compileTimeout = -1;
    let ast = [];
    let compiling = true;
    let compileError = null as string;

    let saveState = 0;

    const screen = derived([params, experiment], ([params, experiment], set) => {
        if (params.sid && experiment) {
            fetch('/experiments/' + experiment.id + '/screens/' + params.sid).then((response) => {
                response.json().then((data) => {
                    set(data);
                    code = data.code;
                })
            });
        }
    }, null as ExperimentScreen);

    function compile(code: string): void {
        async function run_compilation(): Promise<void> {
            compiling = true;
            compileError = null;
            const response = await fetch('/experiments/' + $experiment.id + '/screens/' + $params.sid + '/compile', {
                method: 'POST',
                body: JSON.stringify({'code': code}),
            });
            if (response.status === 200) {
                ast = await response.json()
            } else {
                compileError = (await response.json()).error;
            }
            compiling = false;
        }

        window.clearTimeout(compileTimeout);
        compileTimeout = window.setTimeout(run_compilation, 2000);
    }

    $: {
        compile(code);
    }

    async function save() {
        saveState = 1;
        try {
            await fetch('/experiments/' + $experiment.id + '/screens/' + $params.sid, {
                method: 'PUT',
                body: JSON.stringify({
                    name: $screen.name,
                    code: code
                }),
            });
            saveState = 2;
            window.setTimeout(() => {
                saveState = 0;
            }, 2000);
        } catch {
            saveState = 0;
        }
    }

    function editorKeydown(ev: KeyboardEvent) {
        if (ev.ctrlKey && ev.key === 's') {
            ev.preventDefault();
            save();
        }
    }
</script>

{#if $screen}
    <h1>{$experiment.title} - {$screen.name}</h1>

    <Toolbar>
        <Button on:action={save}>
            <Icon label="Save changes">
                {#if saveState === 0}
                    <path fill="currentColor" d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
                {:else if saveState === 1}
                    <path fill="currentColor" d="M21 11.7V7L17 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H11.7C11.4 20.3 11.2 19.6 11.1 18.8C9.9 18.4 9 17.3 9 16C9 14.3 10.3 13 12 13C12.3 13 12.6 13.1 12.9 13.2C14.2 11.8 16 11 18 11C19.1 11 20.1 11.2 21 11.7M15 9H5V5H15V9M21.7 18.6V17.6L22.8 16.8C22.9 16.7 23 16.6 22.9 16.5L21.9 14.8C21.9 14.7 21.7 14.7 21.6 14.7L20.4 15.2C20.1 15 19.8 14.8 19.5 14.7L19.3 13.4C19.3 13.3 19.2 13.2 19.1 13.2H17.1C16.9 13.2 16.8 13.3 16.8 13.4L16.6 14.7C16.3 14.9 16.1 15 15.8 15.2L14.6 14.7C14.5 14.7 14.4 14.7 14.3 14.8L13.3 16.5C13.3 16.6 13.3 16.7 13.4 16.8L14.5 17.6V18.6L13.4 19.4C13.3 19.5 13.2 19.6 13.3 19.7L14.3 21.4C14.4 21.5 14.5 21.5 14.6 21.5L15.8 21C16 21.2 16.3 21.4 16.6 21.5L16.8 22.8C16.9 22.9 17 23 17.1 23H19.1C19.2 23 19.3 22.9 19.3 22.8L19.5 21.5C19.8 21.3 20 21.2 20.3 21L21.5 21.4C21.6 21.4 21.7 21.4 21.8 21.3L22.8 19.6C22.9 19.5 22.9 19.4 22.8 19.4L21.7 18.6M18 19.5C17.2 19.5 16.5 18.8 16.5 18S17.2 16.5 18 16.5 19.5 17.2 19.5 18 18.8 19.5 18 19.5Z" />
                {:else if saveState === 2}
                    <path fill="currentColor" d="M17 3H5C3.9 3 3 3.9 3 5V19C3 20.11 3.9 21 5 21H11.81C11.42 20.34 11.17 19.6 11.07 18.84C9.5 18.31 8.66 16.6 9.2 15.03C9.61 13.83 10.73 13 12 13C12.44 13 12.88 13.1 13.28 13.29C15.57 11.5 18.83 11.59 21 13.54V7L17 3M15 9H5V5H15V9M15.75 21L13 18L14.16 16.84L15.75 18.43L19.34 14.84L20.5 16.25L15.75 21" />
                {/if}
            </Icon>
        </Button>
        <Button>
            <Icon label="Settings">
                <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
            </Icon>
        </Button>
    </Toolbar>

    <div class="h-screen-7/10 flex flex-row space-x-4" on:keydown={editorKeydown}>
        <section class="flex-1">
            <h2 class="sr-only">Screen editor</h2>
            <CodeEditor bind:value={code} />
        </section>
        <section class="flex-1 relative">
            <h2 class="sr-only">Screen view</h2>
            {#if compileError}
                <p class="font-mono text-red-500 whitespace-pre">{compileError}</p>
            {:else}
                {#each ast as instruction}
                    {#if instruction.op === 'Markdown'}
                        <div>{@html marked(instruction.string)}</div>
                    {:else if instruction.op === 'Checkbox'}
                        <div><Input type="checkbox" value={true}>{instruction.label}</Input></div>
                    {:else}
                        <div>{instruction.op}</div>
                    {/if}
                {/each}
            {/if}
            {#if compiling}
                <div transition:fade class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span class="sr-only">Compiling your code</span>
                    <svg viewBox="0 0 24 24" class="inline-block w-20 h-20 text-neutral-900 animate-spin" aria-hidden="true">
                        <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                    </svg>
                </div>
            {/if}
        </section>
    </div>
{:else}
    <h1>Loading...</h1>
{/if}
