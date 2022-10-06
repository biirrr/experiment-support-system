<script lang="ts">
    export let size = 'normal';
    export let label: string;
</script>

<span class="sr-only">{label}</span>
<svg viewBox="0 0 24 24" class="inline-block {size === 'lg' ? 'w-8 h-8' : (size === 'sm' ? 'w-4 h-4' : 'w-6 h-6')}" aria-hidden="true">
    <slot></slot>
</svg>
