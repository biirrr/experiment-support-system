<template>
    <section class="grid-container">
        <div class="grid-x grid-padding-x">
            <form v-if="questions && responses" class="cell" @submit="submitForm">
                <h1>{{ page.attributes.title }}</h1>
                <question-renderer v-for="question in questions" :key="question.id" :question="question" v-model="responses[question.id]" :error="errors[question.id]"/>
                <div class="buttons">
                    <ul class="menu">
                        <li>
                            <button class="button">{{ nextButtonLabel }}</button>
                        </li>
                    </ul>
                </div>
            </form>
        </div>
    </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';

import QuestionRenderer from '@/components/QuestionRenderer.vue';
import { Page, ResponsesDict, ErrorsDict, Error } from '@/interfaces';

@Component({
    components: {
        QuestionRenderer,
    }
})
export default class PageRenderer extends Vue {
    @Prop() page!: Page;
    public responses = null as ResponsesDict | null;
    public errors = {} as ErrorsDict;

    public get questions() {
        if (this.page) {
            return this.page.relationships.questions.data.map((questionRef) => {
                return this.$store.state.questions[questionRef.id];
            }).filter((question) => {
                if (question.attributes.essConditional && question.attributes.essConditional.question !== '') {
                    const responses = {} as ResponsesDict;
                    (Object.values(this.$store.state.progress.responses) as ResponsesDict[]).forEach((pageResponses) => {
                        Object.entries(pageResponses).forEach(([questionId, response]) => {
                            responses[questionId] = deepcopy(response);
                        });
                    });
                    if (this.responses) {
                        Object.entries(this.responses as ResponsesDict).forEach(([questionId, response]) => {
                            responses[questionId] = deepcopy(response);
                        });
                    }
                    if (question.attributes.essConditional.question.indexOf('.') >= 0) {
                        const path = question.attributes.essConditional.question.split('.');
                        if (path.length === 2 && responses[path[0]] && (responses[path[0]] as ResponsesDict)[path[1]]) {
                            if (question.attributes.essConditional.operator === 'eq') {
                                return (responses[path[0]] as ResponsesDict)[path[1]] === question.attributes.essConditional.value;
                            } else {
                                return (responses[path[0]] as ResponsesDict)[path[1]] !== question.attributes.essConditional.value;
                            }
                        }
                    } else {
                        if (responses[question.attributes.essConditional.question]) {
                            if (question.attributes.essConditional.operator === 'eq') {
                                return responses[question.attributes.essConditional.question] === question.attributes.essConditional.value;
                            } else {
                                return responses[question.attributes.essConditional.question] !== question.attributes.essConditional.value;
                            }
                        }
                    }
                    return false;
                }
                return question;
            });
        } else {
            return [];
        }
    }

    public get isFirstPage() {
        return this.$store.state.experiment && this.$store.state.experiment.relationships['first-page'] && this.page.id === this.$store.state.experiment.relationships['first-page'].data.id;
    }

    public get isLastPage() {
        return this.page.relationships.next.data.length === 0;
    }

    public get nextButtonLabel() {
        if (this.$store.state.ui.busy) {
            if (this.isLastPage) {
                return 'Saving...';
            } else {
                return 'Validating...';
            }
        } else {
            if (this.isLastPage) {
                return 'Finish';
            } else if (this.isFirstPage) {
                return 'Start';
            } else {
                return 'Next page';
            }
        }
    }

    public mounted() {
        this.responses = this.createResponseSet();
        this.errors = {};
    }

    @Watch('page')
    public updatePage() {
        this.responses = this.createResponseSet();
        this.errors = {};
    }

    public async submitForm(ev: Event) {
        ev.preventDefault();
        if (this.responses) {
            try {
                if (this.isLastPage) {
                    await this.$store.dispatch('validateSubmission', {'page': this.page.id, 'responses': this.validatableResponses(this.responses)});
                    await this.$store.dispatch('submitResponses');
                } else {
                    this.errors = {};
                    await this.$store.dispatch('validateSubmission', {'page': this.page.id, 'responses': this.validatableResponses(this.responses)});
                    const transition = this.$store.state.transitions[this.page.relationships.next.data[0].id];
                    if (transition) {
                        const page = this.$store.state.pages[transition.relationships.target.data.id];
                        if (page) {
                            this.$store.commit('setCurrentPage', page);
                        }
                    }
                }
            } catch(error) {
                const errors = {} as ErrorsDict;
                error.forEach((item: Error) => {
                    if (item.source && item.source.pointer) {
                        const keys = item.source.pointer.substring(1).split('/');
                        let target = errors;
                        for (let idx = 0; idx < keys.length; idx++) {
                            if (idx === keys.length - 1) {
                                target[keys[idx]] = item.title;
                            } else {
                                if (!target[keys[idx]]) {
                                    target[keys[idx]] = {};
                                }
                                target = target[keys[idx]] as ErrorsDict;
                            }
                        }
                    }
                });
                this.errors = errors;
            }
        }
    }

    private createResponseSet() {
        const responses = {} as ResponsesDict;
        this.questions.forEach((question) => {
            const questionType = this.$store.state.questionTypes[question.relationships['question-type'].data.id];
            if (questionType) {
                let storedValue = undefined as undefined | null | string | string[] | ResponsesDict;
                if (this.$store.state.progress.responses[this.page.id] && this.$store.state.progress.responses[this.page.id][question.id]) {
                    storedValue = this.$store.state.progress.responses[this.page.id][question.id];
                }
                if (questionType.attributes._core_type === 'USEFDisplay') {
                    responses[question.id] = undefined;
                } else if (questionType.attributes._core_type === 'USEFSingleLineInput') {
                    if (storedValue == undefined) {
                        responses[question.id] = null;
                    } else {
                        responses[question.id] = storedValue;
                    }
                } else if (questionType.attributes._core_type === 'USEFMultiLineInput') {
                    if (storedValue == undefined) {
                        responses[question.id] = null;
                    } else {
                        responses[question.id] = storedValue;
                    }
                } else if (questionType.attributes._core_type === 'USEFSingleChoice') {
                    if (storedValue == undefined) {
                        responses[question.id] = null;
                    } else {
                        responses[question.id] = storedValue;
                    }
                } else if (questionType.attributes._core_type === 'USEFMultiChoice') {
                    if (storedValue == undefined) {
                        responses[question.id] = [];
                    } else {
                        responses[question.id] = storedValue;
                    }
                } else if (questionType.attributes._core_type === 'USEFHidden') {
                    responses[question.id] = question.attributes.value;
                } else if (questionType.attributes._core_type === 'USEFSingleChoiceGrid') {
                    responses[question.id] = {} as ResponsesDict;
                    question.attributes.rowValues.forEach((row: string) => {
                        if (!storedValue || (storedValue as ResponsesDict)[row] === undefined) {
                            (responses[question.id] as ResponsesDict)[row] = null;
                        } else {
                            (responses[question.id] as ResponsesDict)[row] = (storedValue as ResponsesDict)[row];
                        }
                    });
                } else if (questionType.attributes._core_type === 'USEFMultiChoiceGrid') {
                    responses[question.id] = {} as ResponsesDict;
                    question.attributes.rowValues.forEach((row: string) => {
                        if (!storedValue || (storedValue as ResponsesDict)[row] === undefined) {
                            (responses[question.id] as ResponsesDict)[row] = [];
                        } else {
                            (responses[question.id] as ResponsesDict)[row] = (storedValue as ResponsesDict)[row];
                        }
                    });
                }
            }
        });
        return responses;
    }

    /**
     * Filter out undefined responses (which are USEFDisplay questions)
     */
    private validatableResponses(responses: ResponsesDict) {
        const result = {} as ResponsesDict
        Object.entries(responses).forEach(([key, value]: [string, undefined | null | string | string[] | ResponsesDict]) => {
            if (value !== undefined) {
                result[key] = value;
            }
        });
        return result;
    }
}
</script>
