<template>
    <div class="settings grid-x grid-padding-x">
        <h2 class="cell large-12">Settings</h2>
        <div class="cell large-3">
            <aria-menubar v-slot="{ keyboardNav }">
                <ul class="menu vertical" role="menubar">
                    <router-link :to="'/settings'" v-slot="{ href, navigate, isExactActive }">
                        <li :class="isExactActive ? 'is-active': ''" role="presentation">
                            <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="0" role="menuitem" :aria-current="isExactActive ? 'page': null">General</a>
                        </li>
                    </router-link>
                    <router-link v-if="$store.getters.isOwner" :to="'/settings/permissions'" v-slot="{ href, navigate, isActive }">
                        <li :class="isActive ? 'is-active': ''" role="presentation">
                            <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="0" role="menuitem" :aria-current="isActive ? 'page': null">Permissions</a>
                        </li>
                    </router-link>
                    <router-link v-if="$store.getters.isOwner" :to="'/settings/actions'" v-slot="{ href, navigate, isActive }">
                        <li :class="isActive ? 'is-active': ''" role="presentation">
                            <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="0" role="menuitem" :aria-current="isActive ? 'page': null">Actions</a>
                        </li>
                    </router-link>
                </ul>
            </aria-menubar>
        </div>
        <div v-if="isCurrentRoute && localExperiment" class="cell large-9">
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
        <div v-if="!isCurrentRoute" class="cell large-9">
            <router-view></router-view>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';

import { errorsToDict } from 'data-store';

import { StringKeyValueDict, Experiment, PageReference, Page } from '@/interfaces';
import InputField from '@/components/InputField.vue';
import AriaMenubar from '@/components/AriaMenubar.vue';

@Component({
    components: {
        AriaMenubar,
        InputField,
    }
})
export default class Settings extends Vue {
    public localExperiment: Experiment | null = null;
    public errors: StringKeyValueDict = {};

    public get pages() : Page[] {
        if (this.localExperiment && this.$store.state.dataStore.data.pages) {
            return this.localExperiment.relationships.pages.data.map((pageRef: PageReference) => {
                if (this.$store.state.dataStore.data.pages[pageRef.id]) {
                    return this.$store.state.dataStore.data.pages[pageRef.id];
                } else {
                    return null;
                }
            }).filter((page: Page | null) => { return page; });
        } else {
            return [];
        }
    }

    public get isCurrentRoute(): boolean {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.$route.name === 'settings';
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
                await this.$store.dispatch('saveExperiment', this.localExperiment);
            } catch(errors) {
                this.errors = errorsToDict(errors);
            }
        }
    }
}
</script>
