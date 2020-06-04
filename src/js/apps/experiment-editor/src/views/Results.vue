<template>
    <div>
        <nav>
            <ul class="menu align-right">
                <li role="presentation">
                    <a role="menuitem" aria-label="Reload results" @click="reload">
                        <svg viewBox="0 0 24 24" class="icon mdi">
                            <path d="M2 12C2 16.97 6.03 21 11 21C13.39 21 15.68 20.06 17.4 18.4L15.9 16.9C14.63 18.25 12.86 19 11 19C4.76 19 1.64 11.46 6.05 7.05C10.46 2.64 18 5.77 18 12H15L19 16H19.1L23 12H20C20 7.03 15.97 3 11 3C6.03 3 2 7.03 2 12Z" />
                        </svg>
                    </a>
                </li>
                <li role="presentation">
                    <a role="menuitem" :href="$store.state.config.experiment.downloadResultsUrl" target="_blank" aria-label="Download results">
                        <svg viewBox="0 0 24 24" class="icon mdi">
                            <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                        </svg>
                    </a>
                </li>
            </ul>
        </nav>
        <ul class="no-bullet">
            <li v-for="page in pages" :key="page.id" class="grid-x grid-padding-x">
                <div class="cell">
                    <results-summary :page="page"/>
                </div>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Page, TransitionReference } from '@/interfaces';
import ResultsSummary from '@/components/ResultsSummary.vue';

@Component({
    components: {
        ResultsSummary,
    }
})
export default class Results extends Vue {
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

    public reload() {
        this.$store.dispatch('loadResults');
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
