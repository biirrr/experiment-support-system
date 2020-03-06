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
            <li v-for="page in pages" :key="page.id">
                <h2><router-link :to="'/pages/' + page.id">{{ page.attributes.title }}</router-link></h2>
                <template v-if="page.relationships.next.data.length > 0">
                    <p>Transition to:</p>
                    <ul>
                        <template v-for="transition in page.relationships.next.data">
                            <li v-if="pageForId(transition.id)" :key="transition.id">{{ pageForId(transition.id).attributes.title }}</li>
                        </template>
                    </ul>
                </template>
            </li>
        </ul>
    </div>
    <router-view v-else/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Pages extends Vue {
    public get pages() {
        return Object.values(this.$store.state.pages);
    }

    public get isCurrentRoute() {
        return this.$route.name === 'pages';
    }

    public pageForId(id: number) {
        const transition = this.$store.state.transitions[id];
        if (transition) {
            return this.$store.state.pages[transition.relationships.target.data.id];
        }
        return null;
    }
}
</script>
