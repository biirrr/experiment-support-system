<template>
    <div v-if="localExperiment" class="grid-x grid-padding-x">
          <div class="cell auto">
            <form @submit.prevent="updateExperiment">
                <input-field type="text" label="Title" v-model="localExperiment.attributes.title" :error="errors.title"/>
                <input-field type="textarea" label="Description" v-model="localExperiment.attributes.description" :error="errors.description"/>
                <label v-if="localExperiment.relationships['first-page']">First page
                    <select v-model="localExperiment.relationships['first-page'].data.id">
                        <option v-for="page in pages" :key="page.id" :value="page.id">{{ page.attributes.name }} ({{ page.attributes.title }})</option>
                    </select>
                </label>
                <div class="buttons">
                    <ul>
                        <li>
                            <button class="button primary">Update</button>
                        </li>
                    </ul>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';

import { errorsToDict } from 'data-store';

import { StringKeyValueDict, Error, Experiment, PageReference, Page } from '@/interfaces';
import InputField from '@/components/InputField.vue';

@Component({
    components: {
        InputField,
    }
})
export default class Settings extends Vue {
    public localExperiment: Experiment | null = null;
    public errors: StringKeyValueDict = {};

    public get pages() : Page[] {
        if (this.localExperiment) {
            return this.localExperiment.relationships.pages.data.map((pageRef: PageReference) => {
                if (this.$store.state.pages[pageRef.id]) {
                    return this.$store.state.pages[pageRef.id];
                } else {
                    return null;
                }
            }).filter((page: Page | null) => { return page; });
        } else {
            return [];
        }
    }

    public mounted(): void {
        if (this.$store.getters.experiment) {
            this.localExperiment = deepcopy(this.$store.getters.experiment);
            if (this.localExperiment && !this.localExperiment.relationships['first-page'] && this.pages.length > 0) {
                this.localExperiment.relationships['first-page'] = {
                    data: {
                        type: 'pages',
                        id: '',
                    },
                };
            }
        } else {
            this.localExperiment = null;
        }
    }

    @Watch('experiment')
    public watchExperiment() : void {
        if (this.$store.getters.experiment) {
            this.localExperiment = deepcopy(this.$store.getters.experiment);
            if (this.localExperiment && !this.localExperiment.relationships['first-page'] && this.pages.length > 0) {
                this.localExperiment.relationships['first-page'] = {
                    data: {
                        type: 'pages',
                        id: '',
                    },
                };
            }
        } else {
            this.localExperiment = null;
        }
    }

    public async updateExperiment() : Promise<void> {
        if (this.localExperiment) {
            try {
                this.errors = {};
                await this.$store.dispatch('updateExperiment', this.localExperiment);
            } catch(errors) {
                this.errors = errorsToDict(errors);
            }
        }
    }
}
</script>
