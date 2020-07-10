<template>
    <div>
        <template v-if="questionResults">
            <h2>{{ page.attributes.name }} ({{ page.attributes.title }})</h2>
            <question-results v-for="[question, result] in questionResults" :question="question" :results="result" :key="question.id"/>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Page, Question, Result } from '@/interfaces';
import QuestionResults from '@/components/QuestionResults.vue';

@Component({
    components: {
        QuestionResults,
    }
})
export default class ResultsSummary extends Vue {
    @Prop() page!: Page;

    public get questionResults() : [Question, Result][] | null {
        if (this.page && this.$store.state.dataStore.data.questions && this.$store.state.dataStore.data.questionTypes && this.$store.state.dataStore.data.results) {
            const questions = this.page.relationships.questions.data.map((qref) => {
                if (this.$store.state.dataStore.data.questions[qref.id]) {
                    const questionTypeId = this.$store.state.dataStore.data.questions[qref.id].relationships['question-type'].data.id;
                    if (this.$store.state.dataStore.data.questionTypes[questionTypeId]) {
                        if (this.$store.state.dataStore.data.questionTypes[questionTypeId].attributes['_core_type'] !== 'USEFDisplay') {
                            if (this.$store.state.dataStore.data.results[this.page.id]) {
                                return [this.$store.state.dataStore.data.questions[qref.id], this.$store.state.dataStore.data.results[this.page.id]];
                            }
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }).filter((question) => { return question; }) as [Question, Result][];
            if (questions.length > 0) {
                return questions;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}
</script>
