<template>
    <div>
        <p>{{ experiment.attributes.description }}</p>
        <table style="max-width: 20rem;">
            <tbody>
                <tr>
                    <th scope="row">Participants</th>
                    <td>{{ experiment.attributes._stats.participants.started }}</td>
                </tr>
                <tr>
                    <th scope="row">Completed</th>
                    <td>{{ experiment.attributes._stats.participants.completed }}<template v-if="experiment.attributes._stats.participants.started > 0"> ({{ Math.round(100 / experiment.attributes._stats.participants.started * experiment.attributes._stats.participants.completed) }}%)</template></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Experiment } from '@/interfaces';

@Component
export default class Overview extends Vue {
    public get experiment(): Experiment {
        return this.$store.getters.experiment;
    }
}
</script>
