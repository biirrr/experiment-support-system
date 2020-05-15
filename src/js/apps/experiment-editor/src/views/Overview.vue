<template>
    <div>
        {{ experiment.attributes.description }}
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Overview extends Vue {
    public get experiment() {
        return this.$store.state.experiment;
    }
}
</script>
