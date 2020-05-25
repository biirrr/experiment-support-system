<template>
    <div v-if="isCurrentRoute">
        <nav>
            <ul class="menu align-right">
                <router-link to="/pages/create" v-slot="{ href, navigate}">
                    <li role="presentation">
                        <a :href="href" @click="navigate" class="button hollow small primary">Add a page</a>
                    </li>
                </router-link>
            </ul>
        </nav>
        <ul class="no-bullet">
            <li v-for="page in pages" :key="page.id" class="grid-x grid-padding-x">
                <div class="cell auto">
                    <h2><router-link :to="'/pages/' + page.id">{{ page.attributes.name }} ({{ page.attributes.title }})</router-link></h2>
                    <ul class="menu">
                        <li v-if="page.relationships.next.data.length === 0" class="menu-text">End of Experiment</li>
                        <template v-else>
                            <li class="menu-text">Transition to</li>
                            <template v-for="transition in page.relationships.next.data">
                                <template v-if="pageForTransitionId(transition.id)">
                                    <router-link :key="transition.id" :to="'/pages/' + pageForTransitionId(transition.id).id" v-slot="{ href, navigate}">
                                        <li>
                                            <a :href="href" @click="navigate">{{ pageForTransitionId(transition.id).attributes.name }}</a>
                                        </li>
                                    </router-link>
                                </template>
                            </template>
                        </template>
                    </ul>
                </div>
                <div class="cell shrink">
                    <aria-menubar v-slot="{ keyboardNav }">
                        <ul class="menu vertical" role="menubar">
                            <router-link :to="'/pages/' + page.id" v-slot="{ href, navigate}">
                                <li role="presentation">
                                    <a role="menuitem" tabindex="0" aria-label="Edit this page" :href="href" @keyup="keyboardNav" @click="navigate">
                                        <svg viewBox="0 0 24 24" class="mdi icon">
                                            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                        </svg>
                                    </a>
                                </li>
                            </router-link>
                            <li role="presentation">
                                <a role="menuitem" tabindex="0" aria-label="Delete this page" @keyup="keyboardNav" @click="deletePage(page)">
                                    <svg viewBox="0 0 24 24" class="mdi icon alert">
                                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </aria-menubar>
                </div>
            </li>
        </ul>
    </div>
    <router-view v-else/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import AriaMenubar from '@/components/AriaMenubar.vue';
import { Page, TransitionReference } from '@/interfaces';

@Component({
    components: {
        AriaMenubar,
    },
})
export default class Pages extends Vue {
    public get experiment() {
        return this.$store.state.experiment;
    }

    public get firstPage() {
        if (this.experiment && this.experiment.relationships['first-page']) {
            return this.$store.state.pages[this.experiment.relationships['first-page'].data.id];
        } else {
            return null;
        }
    }

    public get pages() {
        if (this.firstPage) {
            const pages = this.flattenPages(this.firstPage);
            (Object.values(this.$store.state.pages) as Page[]).forEach((page: Page) => {
                let found = false;
                pages.forEach((existing) => {
                    if (page.id === existing.id) {
                        found = true;
                    }
                });
                if (!found) {
                    pages.push(page);
                }
            });
            return pages;
        } else {
            return Object.values(this.$store.state.pages);
        }
    }

    public get isCurrentRoute() {
        return this.$route.name === 'pages';
    }

    public pageForTransitionId(id: string) {
        const transition = this.$store.state.transitions[id];
        if (transition) {
            return this.$store.state.pages[transition.relationships.target.data.id];
        }
        return null;
    }

    public async deletePage(page: Page) {
        if (confirm('Please confirm that you wish to delete the page "' + page.attributes.name + '"?')) {
            await this.$store.dispatch('deletePage', page);
        }
    }

    private flattenPages(page: Page) {
        let pages = [page];
        if (page.relationships.next) {
            page.relationships.next.data.forEach((transRef: TransitionReference) => {
                const transition = this.$store.state.transitions[transRef.id];
                if (transition && transition.relationships.target) {
                    const next = this.$store.state.pages[transition.relationships.target.data.id];
                    if (next) {
                        pages = pages.concat(this.flattenPages(next));
                    }
                }
            });
        }
        return pages;
    }
}
</script>
