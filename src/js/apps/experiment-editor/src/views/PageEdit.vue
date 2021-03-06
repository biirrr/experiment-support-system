<template>
    <div v-if="page" class="grid-x grid-padding-x page-editor">
        <div class="cell auto">
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
                            <router-link :to="'/pages/' + page.id + '/transitions'" v-slot="{ href, navigate, isActive }">
                                <li :class="isActive ? 'is-active': ''" role="presentation">
                                    <a :href="href" @keyup="keyboardNav" @click="navigate" tabindex="0" role="menuitem">Transitions</a>
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
                    <add-question v-if="questions.length === 0" :page="page" :idx="-1" />
                    <ol v-else class="no-bullet">
                        <li v-for="question, idx in questions" :key="question.id" class="question">
                            <add-question v-if="insertIdx === idx && insertPosition === 'before'" :page="page" :idx="idx" :canCancel="true" @close="insertQuestion(-1, '')" />
                            <div v-else class="insert-link">
                                <a @click="insertQuestion(idx, 'before')" aria-label="Insert a question before this question" title="Insert a question before this question">
                                    <svg viewBox="0 0 24 24" class="mdi icon">
                                        <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                                    </svg>
                                </a>
                            </div>
                            <question-block :page="page" :question="question"/>
                            <add-question v-if="insertIdx === idx && insertPosition === 'after'" :page="page" :idx="idx + 1" :canCancel="true" @close="insertQuestion(-1, '')" />
                            <div v-else class="insert-link">
                                <a @click="insertQuestion(idx, 'after')" aria-label="Insert a question after this question" title="Insert a question after this question">
                                    <svg viewBox="0 0 24 24" class="mdi icon">
                                        <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                                    </svg>
                                </a>
                            </div>
                        </li>
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
import QuestionBlock from '@/components/QuestionBlock.vue';
import { QuestionReference, Question, Page } from '@/interfaces';

@Component({
    components: {
        AriaMenubar,
        AddQuestion,
        QuestionBlock,
    }
})
export default class PageEdit extends Vue {
    public insertIdx = -1;
    public insertPosition = '';

    public get page(): Page | null {
        if (this.$store.state.dataStore.data.pages) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const page = this.$store.state.dataStore.data.pages[this.$route.params.pid];
            if (page) {
                return page;
            }
        }
        return null;
    }

    public get isCurrentRoute(): boolean {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.$route.name === 'page.edit';
    }

    public get questions() : Question[] {
        if (this.page && this.page.relationships && this.$store.state.dataStore.data.questions) {
            return this.page.relationships.questions.data.map((question: QuestionReference) => {
                return this.$store.state.dataStore.data.questions[question.id];
            }).filter((question: Question) => { return question; });
        }
        return [];
    }

    public insertQuestion(idx: number, position: string) : void {
        this.insertIdx = idx;
        this.insertPosition = position;
    }
}
</script>
