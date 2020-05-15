<template>
    <div>
        <ul class="menu vertical">
              <li v-for="(questionTypeGroup, key) in questionTypeGroups" :key="key">
                <router-link :to="'/question-type-groups/' + key" v-slot="{ href, navigate }">
                    <li>
                        <a :href="href" @click="navigate">{{ questionTypeGroup.attributes.title }}</a>
                    </li>
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class Index extends Vue {
    public get questionTypeGroups() {
        return this.$store.state.questionTypeGroups;
    }
}
</script>
