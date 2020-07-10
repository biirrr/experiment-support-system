<template>
    <section class="grid-container">
        <div class="grid-x grid-padding-x">
            <form v-if="questions && responses" class="cell" @submit="submitForm">
                <h1>{{ page.attributes.title }}</h1>
                <question-renderer v-for="question in visibleQuestions" :key="question.id" :question="question" v-model="responses[question.id]" :error="errors[question.id]"/>
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

import { JSONAPIError } from 'data-store';

import QuestionRenderer from '@/components/QuestionRenderer.vue';
import { Page, Question, ResponsesDict, QuestionAttributes, StringKeyValueDict } from '@/interfaces';

@Component({
    components: {
        QuestionRenderer,
    }
})
export default class PageRenderer extends Vue {
    @Prop() page!: Page;
    public responses = null as ResponsesDict | null;
    public errors = {};

    public get questions(): Question[] {
        return this.page.relationships.questions.data.map((questionRef) => {
            return this.$store.state.dataStore.data.questions[questionRef.id];
        }).filter((question) => { return question });
    }

    public get visibleQuestions(): Question[] {
        let responses = {} as ResponsesDict;
        (Object.values(this.$store.state.progress.responses) as ResponsesDict[]).forEach((pageResponses) => {
            Object.entries(pageResponses).forEach(([questionId, response]) => {
                responses[questionId] = deepcopy(response);
            });
        });
        responses = { ...responses, ...this.responses };
        return this.questions.filter((question) => {
            if (question.attributes.essConditional && (question.attributes.essConditional as QuestionAttributes).question !== '') {
                let response = null;
                if ((question.attributes.essConditional as QuestionAttributes).subQuestion && responses[(question.attributes.essConditional as QuestionAttributes).question as string]) {
                    response = (responses[(question.attributes.essConditional as QuestionAttributes).question as string] as ResponsesDict)[(question.attributes.essConditional as QuestionAttributes).subQuestion as string];
                } else {
                    response = responses[(question.attributes.essConditional as QuestionAttributes).question as string];
                }
                if ((question.attributes.essConditional as QuestionAttributes).operator === 'eq') {
                    if (response) {
                        if (response === (question.attributes.essConditional as QuestionAttributes).value || (Array.isArray(response) && response.includes((question.attributes.essConditional as QuestionAttributes).value as string))) {
                            return true;
                        }
                    }
                } else if ((question.attributes.essConditional as QuestionAttributes).operator === 'neq') {
                    if (response) {
                        if (Array.isArray(response) && !response.includes((question.attributes.essConditional as QuestionAttributes).value as string)) {
                            return true;
                        } else if (response !== (question.attributes.essConditional as QuestionAttributes).value) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }
                return false;
            } else {
                return true;
            }
        });
    }

    public get isFirstPage(): boolean {
        return this.$store.getters.experiment.relationships['first-page'].data.id === this.page.id;
    }

    public get isLastPage(): boolean {
        return !this.page.relationships.next || this.page.relationships.next.data.length === 0;
    }

    public get nextButtonLabel(): string {
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

    public mounted(): void {
        this.responses = this.createResponseSet();
        this.errors = {};
        window.document.title = this.page.attributes.title;
    }

    @Watch('page')
    public updatePage(): void {
        this.responses = this.createResponseSet();
        this.errors = {};
        window.document.title = this.page.attributes.title;
    }

    public async submitForm(ev: Event): Promise<void> {
        ev.preventDefault();
        if (this.responses) {
            try {
                if (this.isLastPage) {
                    await this.$store.dispatch('validateSubmission', {'page': this.page.id, 'responses': this.validatableResponses(this.responses)});
                    await this.$store.dispatch('submitResponses');
                } else {
                    this.errors = {};
                    await this.$store.dispatch('validateSubmission', {'page': this.page.id, 'responses': this.validatableResponses(this.responses)});
                    const transition = this.$store.state.dataStore.data.transitions[this.page.relationships.next.data[0].id];
                    if (transition) {
                        const page = this.$store.state.dataStore.data.pages[transition.relationships.target.data.id];
                        if (page) {
                            this.$store.commit('setCurrentPage', page);
                        }
                    }
                }
            } catch(errors) {
                this.errors = errors.reduce((obj: StringKeyValueDict, error: JSONAPIError) => {
                    const pointer = error.source.pointer.split('/');
                    obj[pointer[pointer.length - 1]] = error.title;
                    return obj;
                }, {});
                console.log(this.errors);
            }
        }
    }

    private createResponseSet(): ResponsesDict {
        const responses = {} as ResponsesDict;
        this.questions.forEach((question) => {
            const questionType = this.$store.state.dataStore.data['question-types'][question.relationships['question-type'].data.id];
            if (questionType) {
                let storedValue = undefined as undefined | null | string | string[] | ResponsesDict;
                if (this.$store.state.progress.responses[this.page.id] && this.$store.state.progress.responses[this.page.id][question.id]) {
                    storedValue = this.$store.state.progress.responses[this.page.id][question.id];
                }
                if (questionType.attributes.essCoreType === 'USEFDisplay') {
                    responses[question.id] = undefined;
                } else if (questionType.attributes.essCoreType === 'USEFSingleLineInput') {
                    if (storedValue == undefined) {
                        responses[question.id] = null;
                    } else {
                        responses[question.id] = storedValue;
                    }
                } else if (questionType.attributes.essCoreType === 'USEFMultiLineInput') {
                    if (storedValue == undefined) {
                        responses[question.id] = null;
                    } else {
                        responses[question.id] = storedValue;
                    }
                } else if (questionType.attributes.essCoreType === 'USEFSingleChoice') {
                    if (storedValue == undefined) {
                        responses[question.id] = null;
                    } else {
                        responses[question.id] = storedValue;
                    }
                } else if (questionType.attributes.essCoreType === 'USEFMultiChoice') {
                    if (storedValue == undefined) {
                        responses[question.id] = [];
                    } else {
                        responses[question.id] = storedValue;
                    }
                } else if (questionType.attributes.essCoreType === 'USEFHidden') {
                    responses[question.id] = question.attributes.value;
                } else if (questionType.attributes.essCoreType === 'USEFSingleChoiceGrid') {
                    responses[question.id] = {} as ResponsesDict;
                    (question.attributes.rowValues as string[]).forEach((row: string) => {
                        if (!storedValue || (storedValue as ResponsesDict)[row] === undefined) {
                            (responses[question.id] as ResponsesDict)[row] = null;
                        } else {
                            (responses[question.id] as ResponsesDict)[row] = (storedValue as ResponsesDict)[row];
                        }
                    });
                } else if (questionType.attributes.essCoreType === 'USEFMultiChoiceGrid') {
                    responses[question.id] = {} as ResponsesDict;
                    (question.attributes.rowValues as string[]).forEach((row: string) => {
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
    private validatableResponses(responses: ResponsesDict): ResponsesDict {
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
