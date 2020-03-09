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
                <div v-if="isCurrentRoute" class="cell large-9">
                    <add-question v-if="questions.length === 0" :page="page" :idx="-1"></add-question>
                    <ol v-else class="no-bullet">
                        <template v-for="question in questions">
                            <li v-if="question" :key="question.idx">{{ question }}</li>
                        </template>
                    </ol>
                </div>
                <div v-if="!isCurrentRoute" class="cell large-9">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import AriaMenubar from '@/components/AriaMenubar.vue';
import AddQuestion from '@/components/AddQuestion.vue';
import { QuestionReference } from '@/interfaces';

@Component({
    components: {
        AriaMenubar,
        AddQuestion,
    }
})
export default class PageEdit extends Vue {
    public get page() {
        return this.$store.state.pages[this.$route.params.pid];
    }

    public get isCurrentRoute() {
        return this.$route.name === 'page.edit';
    }

    public get questions() {
        if (this.page.relationships) {
            console.log(this.$store.state.questions);
            return this.page.relationships.questions.data.forEach((question: QuestionReference) => {
                return this.$store.state.questions[question.id];
            });
        }
        return [];
    }

    public get questionTypeGroups() {
        return this.$store.state.questionTypeGroups;
    }
}
</script>
