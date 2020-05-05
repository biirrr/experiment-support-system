<template>
    <question-editor v-if="editing" :question="question" @close="endEditing"/>
    <section v-else class="grid-x">
        <div class="cell large-auto">
            <question-renderer :question="question"/>
        </div>
        <div class="cell large-shrink">
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
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { Question } from '@/interfaces';
import AriaMenubar from '@/components/AriaMenubar.vue';
import QuestionRenderer from '@/components/QuestionRenderer.vue';
import QuestionEditor from '@/components/QuestionEditor.vue';

@Component({
    components: {
        AriaMenubar,
        QuestionRenderer,
        QuestionEditor,
    },
})
export default class QuestionBlock extends Vue {
    @Prop() question!: Question;
    public editing = false;

    public mounted() {
        if (this.$props.question.id == this.newQuestionId) {
            this.editing = true;
            this.$store.commit('setNewQuestionId', '');
        }
    }

    public get newQuestionId() {
        return this.$store.state.ui.newQuestionId;
    }

    @Watch('newQuestionId')
    public newQuestionIdUpdate() {
        if (!this.editing && this.$props.question.id == this.newQuestionId) {
            this.editing = true;
            this.$store.commit('setNewQuestionId', '');
        }
    }

    public startEditing() {
        this.editing = true;
    }

    public endEditing() {
        this.editing = false;
    }
}
</script>
