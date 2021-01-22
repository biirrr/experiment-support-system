<template>
    <div class="grid-x grid-padding-x">
        <div class="cell auto">
            <h2>Add a new page</h2>
            <form @submit.prevent="createPage">
                <input-field type="text" label="Name" v-model="pageName" :error="errors.name"/>
                <input-field type="text" label="Title" v-model="pageTitle" :error="errors.title"/>
                <label>
                    <input type="radio" name="parent" value="first" v-model="addMode" />
                    Add as the first page
                </label>
                <template v-if="hasPages">
                    <label>
                        <input type="radio" name="parent" value="after" v-model="addMode" />
                        Add after
                    </label>
                    <label v-if="addMode === 'after'">
                        <select v-model="parentPageId">
                            <option v-for="page in pages" :value="page.id" :key="page.id">{{ page.attributes.title }}</option>
                        </select>
                    </label>
                </template>
                <div class="buttons">
                    <ul>
                        <li>
                            <router-link :to="'/pages'" class="button secondary">Don't add</router-link>
                        </li>
                        <li>
                            <button class="button primary">Add</button>
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

import InputField from '@/components/InputField.vue';
import { Page, StringKeyValueDict } from '@/interfaces';

@Component({
    components: {
        InputField
    }
})
export default class PagesCreate extends Vue {
    public addMode = 'first';
    public pageName = '';
    public pageTitle = '';
    public parentPageId = '';
    public errors: StringKeyValueDict = {};

    public get pages(): Page[] {
        if (this.$store.state.dataStore.data.pages) {
            return Object.values(this.$store.state.dataStore.data.pages);
        } else {
            return [];
        }
    }

    public get hasPages() : boolean {
        return this.pages && this.pages.length > 0;
    }

    public get showPageSelect() : boolean {
        return this.hasPages && this.addMode === 'after';
    }

    public mounted() : void {
        if (this.hasPages) {
            this.addMode = 'after';
            this.parentPageId = this.pages[0].id;
            for (let idx = 0; idx < this.pages.length; idx++) {
                if (this.pages[idx].relationships.next.data.length === 0) {
                    this.parentPageId = this.pages[idx].id;
                    break;
                }
            }
        }
    }

    @Watch('pages')
    public updateAddMode() : void {
        if (this.hasPages) {
            this.addMode = 'after';
            this.parentPageId = this.pages[0].id;
            for (let idx = 0; idx < this.pages.length; idx++) {
                if (this.pages[idx].relationships.next.data.length === 0) {
                    this.parentPageId = this.pages[idx].id;
                    break;
                }
            }
        } else {
            this.addMode = 'first';
        }
    }

    public async createPage() : Promise<void> {
        try {
            const addMode = this.addMode;
            const parentPageId = this.parentPageId;
            const page = await this.$store.dispatch('createPage', {
                type: 'pages',
                attributes: {
                    name: this.pageName,
                    title: this.pageTitle,
                },
                relationships: {
                    experiment: {
                        data: {
                            type: 'experiments',
                            id: this.$store.getters.experiment.id,
                        },
                    },
                },
            });
            if (addMode === 'first') {
                const experiment = deepcopy(this.$store.getters.experiment);
                if (!experiment.relationships.firstPage) {
                    experiment.relationships['first-page'] = {
                        data: {
                            type: 'pages',
                            id: page.id,
                        }
                    };
                } else {
                    experiment.relationships.firstPage.data.id = page.id;
                }
                await this.$store.dispatch('saveExperiment', experiment);
            } else {
                await this.$store.dispatch('createTransition', {
                    type: 'transitions',
                    attributes: {
                        condition: 'unconditional',
                    },
                    relationships: {
                        source: {
                            data: {
                                type: 'pages',
                                id: parentPageId,
                            },
                        },
                        target: {
                            data: {
                                type: 'pages',
                                id: page.id,
                            },
                        },
                    },
                });
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.$router.push('/pages/' + page.id);
        } catch(errors) {
            this.errors = errorsToDict(errors);
        }
    }
}
</script>
