<script lang="ts">
    import { fade } from 'svelte/transition';
    import { derived } from 'svelte/store';
    import { useParams } from 'svelte-navigator';
    import { marked } from 'marked';

    import { fetch, experiment } from '../../../stores';
    import { CodeEditor } from '../../../components';

    const params = useParams();
    let code = '';
    let compileTimeout = -1;
    let ast = [];
    let compiling = true;

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
            const response = await fetch('/experiments/' + $experiment.id + '/screens/' + $params.sid + '/compile', {
                method: 'POST',
                body: JSON.stringify({'code': code}),
            });
            ast = await response.json()
            compiling = false;
        }

        window.clearTimeout(compileTimeout);
        compileTimeout = window.setTimeout(run_compilation, 2000);
    }

    $: {
        compile(code);
    }
</script>

{#if $screen}
    <h1>{$experiment.title} - {$screen.name}</h1>

    <div class="h-screen-8/10 flex flex-row space-x-4">
        <section class="flex-1">
            <h2 class="sr-only">Screen editor</h2>
            <CodeEditor bind:value={code} />
        </section>
        <section class="flex-1 relative">
            <h2 class="sr-only">Screen view</h2>
            {#each ast as instruction}
                {#if instruction.op === 'Markdown'}
                    <div>{@html marked(instruction.string)}</div>
                {/if}
            {/each}
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
