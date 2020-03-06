<template>
    <div class="grid-x grid-padding-x">
        <div v-if="page" class="cell auto">
            <h2>{{ page.attributes.title }}</h2>
            <div class="grid-x grid-padding-x">
                <div class="cell large-3">
                    <aria-menubar v-slot="{ keyboardNav }">
                        <ul class="menu vertical" role="menubar">
                            <router-link :to="'/pages/' + page.id" v-slot="{ href, navigate, isExactActive }">
                                <li :class="isExactActive ? 'is-active': ''" role="presentation">
                                    <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="0" role="menuitem">Edit</a>
                                </li>
                            </router-link>
                            <router-link :to="'/pages/' + page.id + '/settings'" v-slot="{ href, navigate, isActive }">
                                <li :class="isActive ? 'is-active': ''" role="presentation">
                                    <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="0" role="menuitem">Settings</a>
                                </li>
                            </router-link>
                        </ul>
                    </aria-menubar>
                </div>
                <div class="cell large-9">
                    <div v-if="isCurrentRoute">
                        Content
                    </div>
                    <router-view v-else></router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import AriaMenubar from '@/components/AriaMenubar.vue';

@Component({
    components: {
        AriaMenubar,
    }
})
export default class PageEdit extends Vue {
    public get page() {
        return this.$store.state.pages[this.$route.params.pid];
    }

    public get isCurrentRoute() {
        return this.$route.name === 'page.edit';
    }
}
</script>
