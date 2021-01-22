<template>
    <transition-editor v-if="editing" :page="page" :transition="transition" @close="endEditing"></transition-editor>
    <section v-else class="margin-bottom-large grid-x">
        <p class="cell auto padding-top">
            Transition to
            <router-link v-if="targetPage" :to="'/pages/' + targetPage.id" v-slot="{ href, navigate}">
                <a :href="href" @click="navigate">{{ targetPage.attributes.name }}<template v-if="targetPage.attributes.title"> ({{ targetPage.attributes.title }})</template></a>
            </router-link>
            <template v-if="transition.attributes.condition === 'answer'">
                if the answer to the question
                <template v-if="conditionQuestion">
                    "{{ conditionQuestion.attributes.essName }}"
                </template>
                on page
                <router-link v-if="conditionPage" :to="'/pages/' + conditionPage.id" v-slot="{ href, navigate}">
                    <a :href="href" @click="navigate">{{ conditionPage.attributes.name }}<template v-if="conditionPage.attributes.title"> ({{ conditionPage.attributes.title }})</template></a>
                </router-link>
                <template v-if="transition.attributes.operator === 'eq'">
                    is
                </template>
                <template v-else-if="transition.attributes.operator === 'neq'">
                    is not
                </template>
                "{{ transition.attributes.value }}".
            </template>
            <template v-else>.</template>
        </p>
        <div class="cell shrink">
            <aria-menubar v-slot="{ keyboardNav }">
                <ul class="menu vertical" role="menubar">
                    <li role="presentation">
                        <a role="menuitem" tabindex="0" aria-label="Edit" @keyup="keyboardNav" @click="startEditing">
                            <svg viewBox="0 0 24 24" class="mdi icon">
                                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                            </svg>
                        </a>
                    </li>
                </ul>
            </aria-menubar>
        </div>
    </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Transition, Page, Question } from '@/interfaces';
import AriaMenubar from '@/components/AriaMenubar.vue';
import TransitionEditor from '@/components/TransitionEditor.vue';

@Component({
    components: {
        AriaMenubar,
        TransitionEditor,
    },
})
export default class TransitionBlock extends Vue {
    @Prop() transition!: Transition;
    @Prop() page!: Page;
    public editing = false;

    public get targetPage(): Page | null {
        if (this.transition && this.$store.state.dataStore.data.pages) {
            const page = this.$store.state.dataStore.data.pages[this.transition.relationships.target.data.id];
            if (page) {
                return page;
            }
        }
        return null;
    }

    public get conditionPage(): Page | null {
        if (this.transition && this.$store.state.dataStore.data.pages && this.transition.attributes.page_id) {
            const page = this.$store.state.dataStore.data.pages[this.transition.attributes.page_id];
            if (page) {
                return page;
            }
        }
        return null;
    }

    public get conditionQuestion(): Question | null {
        if (this.transition && this.$store.state.dataStore.data.questions && this.transition.attributes.question_id) {
            const question = this.$store.state.dataStore.data.questions[this.transition.attributes.question_id];
            if (question) {
                return question;
            }
        }
        return null;
    }

    public startEditing(): void {
        this.editing = true;
    }

    public endEditing(): void {
        this.editing = false;
    }
}
</script>
