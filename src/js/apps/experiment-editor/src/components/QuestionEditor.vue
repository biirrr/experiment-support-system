<template>
    <section class="grid-x">
        <div class="cell large-auto">
            <div v-for="attribute, idx in editableAttributes" :key="idx">
                <label v-if="questionType.attributes.essCoreType === 'USEFDisplay' && attribute[1].type === 'singleValue' && attribute[0] === 'format'">{{ attribute[1].label }}
                    <select v-model="localAttributes[attribute[0]]">
                        <option value="text/html">HTML</option>
                        <option value="text/text">Text</option>
                    </select>
                </label>
                <label v-else-if="(questionType.attributes.essCoreType === 'USEFSingleChoice' || questionType.attributes.essCoreType === 'USEFMultiChoice') && attribute[1].type === 'singleValue' && attribute[0] === 'display'">{{ attribute[1].label }}
                    <select v-model="localAttributes[attribute[0]]">
                        <option v-for="value, idx in attribute[1].allowed" :key="idx" :value="value">{{ value }}</option>
                    </select>
                </label>
                <template v-else-if="attribute[1].type == 'listOfValues'">
                    <label>{{ attribute[1].label }}</label>
                    <table>
                        <tbody>
                            <tr v-for="value, idx in localAttributes[attribute[0]]" :key="idx">
                                <td><input type="text" :value="value" @keyup="setListOfValuesValue(attribute[0], idx, $event.target.value)"/></td>
                                <td>
                                    <aria-menubar v-slot="{ keyboardNav }">
                                        <ul class="menu" role="menubar">
                                            <li role="presentation">
                                                <a role="menuitem" tabindex="0" aria-label="Remove this value" @keyup="keyboardNav" @click="removeListOfValuesValue(attribute[0], idx)">
                                                    <svg viewBox="0 0 24 24" class="mdi icon alert">
                                                        <path d="M19,13H5V11H19V13Z" />
                                                    </svg>
                                                </a>
                                            </li>
                                            <li role="presentation">
                                                <a role="menuitem" tabindex="-1" aria-label="Move this value up" @keyup="keyboardNav">
                                                    <svg viewBox="0 0 24 24" class="mdi icon">
                                                        <path d="M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z" />
                                                    </svg>
                                                </a>
                                            </li>
                                            <li role="presentation">
                                                <a role="menuitem" tabindex="-1" aria-label="Move this value down" @keyup="keyboardNav">
                                                    <svg viewBox="0 0 24 24" class="mdi icon">
                                                        <path d="M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z" />
                                                    </svg>
                                                </a>
                                            </li>
                                        </ul>
                                    </aria-menubar>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2">
                                    <aria-menubar v-slot="{ keyboardNav }">
                                        <ul class="menu" role="menubar">
                                            <li role="presentation">
                                                <a role="menuitem" tabindex="-1" aria-label="Add a value" @keyup="keyboardNav" @click="addListOfValuesValue(attribute[0])">
                                                    <svg viewBox="0 0 24 24" class="mdi icon success">
                                                        <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                                                    </svg>
                                                </a>
                                            </li>
                                        </ul>
                                    </aria-menubar>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </template>
                <input-field v-else-if="attribute[1].type === 'singleValue'" type="text" v-model="localAttributes[attribute[0]]" :label="attribute[1].label"/>
                <input-field v-else-if="attribute[1].type === 'booleanValue'" type="checkbox" v-model="localAttributes[attribute[0]]" :label="attribute[1].label"/>
                <input-field v-else-if="attribute[1].type === 'multiLineTextValue'" type="textarea" v-model="localAttributes[attribute[0]]" :label="attribute[1].label"/>
                <template v-else-if="attribute[1].type === 'essQuestionCondition' && localAttributes[attribute[0]]">
                    <label>{{ attribute[1].label }}</label>
                    <div class="grid-x">
                        <div class="cell auto">
                            <select v-model="localAttributes[attribute[0]].question">
                                <option value="">--- Always display ---</option>
                                <template v-for="[page, question] in listOfConditionalQuestions">
                                    <option :key="question.id" :value="question.id">{{ page.attributes.name }} - {{ question.attributes.essName }}</option>
                                </template>
                            </select>
                        </div>
                        <template v-if="localAttributes[attribute[0]].question !== ''">
                            <div v-if="isMultiQuestionQuestion(localAttributes[attribute[0]].question)" class="cell shrink">
                                <select v-model="localAttributes[attribute[0]].subQuestion">
                                    <option v-for="value in getQuestionAttribute(localAttributes[attribute[0]].question, 'rowValues')" :key="value" :value="value">{{ value }}</option>
                                </select>
                            </div>
                            <div class="cell shrink">
                                <select v-model="localAttributes[attribute[0]].operator">
                                    <option value="eq">Equals</option>
                                    <option value="neq">Not equals</option>
                                </select>
                            </div>
                            <div class="cell auto">
                                <input type="text" v-model="localAttributes[attribute[0]].value"/>
                            </div>
                        </template>
                    </div>
                </template>
                <div v-else>{{ attribute[1] }}</div>
            </div>
        </div>
        <div class="cell large-shrink">
            <aria-menubar v-slot="{ keyboardNav }">
                <ul class="menu vertical sticky top" role="menubar">
                    <li role="presentation">
                        <a role="menuitem" tabindex="0" aria-label="Close the editor" @keyup="keyboardNav" @click="close">
                            <svg viewBox="0 0 24 24" class="mdi icon">
                                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                            </svg>
                        </a>
                    </li>
                    <li role="presentation">
                        <a role="menuitem" tabindex="-1" aria-label="Save the question" @keyup="keyboardNav" @click="save">
                            <svg viewBox="0 0 24 24" :class="{'mdi': true, 'icon': true, 'secondary': !hasChanges}">
                                <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
                            </svg>
                        </a>
                    </li>
                    <li v-if="canMoveUp" role="presentation">
                        <a role="menuitem" tabindex="-1" aria-label="Move up" @keyup="keyboardNav" @click="moveQuestion(-1)">
                            <svg viewBox="0 0 24 24" class="mdi icon">
                                <path d="M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z" />
                            </svg>
                        </a>
                    </li>
                    <li v-else role="presentation" class="menu-text">
                        <svg viewBox="0 0 24 24" class="mdi icon secondary">
                            <path d="M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z" />
                        </svg>
                    </li>
                    <li v-if="canMoveDown" role="presentation">
                        <a role="menuitem" tabindex="-1" aria-label="Move down" @keyup="keyboardNav" @click="moveQuestion(1)">
                            <svg viewBox="0 0 24 24" class="mdi icon">
                                <path d="M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z" />
                            </svg>
                        </a>
                    </li>
                    <li v-else role="presentation" class="menu-text">
                        <svg viewBox="0 0 24 24" class="mdi icon secondary">
                            <path d="M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z" />
                        </svg>
                    </li>
                    <li role="presentation">
                        <a role="menuitem" tabindex="-1" aria-label="Delete" @keyup="keyboardNav" @click="deleteQuestion">
                            <svg viewBox="0 0 24 24" class="mdi icon alert">
                                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepequal from 'deep-equal';

import { errorsToDict } from 'data-store';

import { Page, Question, StringKeyValueDict, QuestionReference, QuestionTypeAttributes, QuestionTypeAttribute, QuestionType } from '@/interfaces';
import AriaMenubar from '@/components/AriaMenubar.vue';
import InputField from '@/components/InputField.vue';

@Component({
    components: {
        InputField,
        AriaMenubar,
    }
})
export default class QuestionEditor extends Vue {
    @Prop() page!: Page
    @Prop() question!: Question;
    public localAttributes = {} as {[x: string]: string | boolean | string[]};
    public errors: StringKeyValueDict = {};


    public get questionType(): QuestionType {
        return this.$store.state.dataStore.data['question-types'][this.question.relationships['question-type'].data.id];
    }

    public get editableAttributes(): [string, string | QuestionTypeAttribute][] {
        return Object.entries(this.questionType.attributes).filter((value) => {
            return value[1] && (value[1] as QuestionTypeAttribute).source === 'user';
        });
    }

    public get attributes(): QuestionTypeAttributes {
        return deepcopy({ ...this.questionType.attributes, ...this.question.attributes });
    }

    public get hasChanges(): boolean {
        let changes = false;
        this.editableAttributes.forEach(([key, questionType]) => {
            if ((questionType as QuestionTypeAttribute).source === 'user') {
                if (!deepequal(this.question.attributes[key], this.localAttributes[key])) {
                    changes = true;
                }
            }
        });
        return changes;
    }

    public get canMoveUp(): boolean {
        if (this.page.relationships.questions.data[0].id === this.question.id) {
            return false;
        } else {
            return true;
        }
    }

    public get canMoveDown(): boolean {
        if (this.page.relationships.questions.data[this.page.relationships.questions.data.length - 1].id === this.question.id) {
            return false;
        } else {
            return true;
        }
    }

    public get listOfConditionalQuestions(): [Page, Question][] {
        const result = [] as [Page, Question][];
        (Object.values(this.$store.state.dataStore.data.pages) as Page[]).forEach((page: Page) => {
            page.relationships.questions.data.forEach((questionRef: QuestionReference) => {
                const question = this.$store.state.dataStore.data.questions[questionRef.id];
                if (question && question.id !== this.question.id) {
                    const questionType = this.$store.state.dataStore.data['question-types'][question.relationships['question-type'].data.id];
                    if (questionType && questionType.attributes.essCoreType !== 'USEFDisplay') {
                        result.push([page, question]);
                    }
                }
            });
        });
        return result;
    }

    public isMultiQuestionQuestion(questionId: string): boolean {
        const question = this.$store.state.dataStore.data.questions[questionId];
        if (question) {
            const questionType = this.$store.state.dataStore.data['question-types'][question.relationships['question-type'].data.id];
            if (questionType && (questionType.attributes.essCoreType === 'USEFSingleChoiceGrid' || questionType.attributes.essCoreType === 'USEFMultiChoiceGrid')) {
                return true;
            }
        }
        return false;
    }

    public getQuestionAttribute(questionId: string, attribute: string): {[x: string]: string | boolean | string[]} | null {
        const question = this.$store.state.dataStore.data.questions[questionId];
        if (question) {
            return question.attributes[attribute];
        }
        return null;
    }

    /**
     *  Life-cycle events and Watches
     */

    public mounted() : void {
        this.localAttributes = deepcopy(this.question.attributes);
        this.editableAttributes.forEach((attr) => {
            if (!this.localAttributes[attr[0]]) {
                if ((attr[1] as QuestionTypeAttribute).source === 'user') {
                    if ((attr[1] as QuestionTypeAttribute).type === 'booleanValue') {
                        Vue.set(this.localAttributes, attr[0], false);
                    } else if ((attr[1] as QuestionTypeAttribute).type === 'listOfValues') {
                        Vue.set(this.localAttributes, attr[0], []);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    } else if ((attr[1] as QuestionTypeAttribute).allowed && (attr[1] as QuestionTypeAttribute).allowed.length > 0) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        Vue.set(this.localAttributes, attr[0], (attr[1] as QuestionTypeAttribute).allowed[0]);
                    } else if ((attr[1] as QuestionTypeAttribute).type === 'essQuestionCondition') {
                        Vue.set(this.localAttributes, attr[0], {
                            question: '',
                        });
                    } else {
                        Vue.set(this.localAttributes, attr[0], '');
                    }
                }
            }
        });
    }

    @Watch('question')
    public updateQuestion() : void {
        this.localAttributes = deepcopy(this.question.attributes);
        this.editableAttributes.forEach((attr) => {
            if (!this.localAttributes[attr[0]]) {
                if ((attr[1] as QuestionTypeAttribute).source === 'user') {
                    if ((attr[1] as QuestionTypeAttribute).type === 'booleanValue') {
                        Vue.set(this.localAttributes, attr[0], false);
                    } else if ((attr[1] as QuestionTypeAttribute).type === 'listOfValues') {
                        Vue.set(this.localAttributes, attr[0], []);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    } else if ((attr[1] as QuestionTypeAttribute).allowed && (attr[1] as QuestionTypeAttribute).allowed.length > 0) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        Vue.set(this.localAttributes, attr[0], (attr[1] as QuestionTypeAttribute).allowed[0]);
                    } else if ((attr[1] as QuestionTypeAttribute).type === 'essQuestionCondition') {
                        Vue.set(this.localAttributes, attr[0], {
                            question: '',
                        });
                    } else {
                        Vue.set(this.localAttributes, attr[0], '');
                    }
                }
            }
        });
    }

    public async save() : Promise<void> {
        const question = deepcopy(this.question);
        question.attributes = this.localAttributes;
        try {
            this.errors = {};
            await this.$store.dispatch('saveQuestion', question);
        } catch(errors) {
            this.errors = errorsToDict(errors);
        }
    }

    public close() : void {
        if (this.hasChanges) {
            if (confirm('This will cause any changes to this question to be lost. Continue?')) {
                this.$emit('close');
            }
        } else {
            this.$emit('close');
        }
    }

    public moveQuestion(direction: number) : void {
        const page = deepcopy(this.page);
        let questionIdx = -1;
        page.relationships.questions.data.forEach((questionRef: QuestionReference, idx: number) => {
            if (questionRef.id === this.question.id) {
                questionIdx = idx;
            }
        });
        if (questionIdx !== -1) {
            const newIdx = questionIdx + direction;
            page.relationships.questions.data.splice(questionIdx, 1);
            page.relationships.questions.data.splice(newIdx, 0, {
                type: 'questions',
                id: this.question.id,
            });
            this.$store.dispatch('savePage', page);
        }
    }

    public deleteQuestion() : void {
        if (confirm('Please confirm that you wish to delete this question?')) {
            this.$store.dispatch('deleteQuestion', this.question);
        }
    }

    public addListOfValuesValue(attribute: string) : void {
        (this.localAttributes[attribute] as string[]).push('');
    }

    public setListOfValuesValue(attribute: string, idx: number, value: string) : void {
        Vue.set((this.localAttributes[attribute] as string[]), idx, value);
    }

    public removeListOfValuesValue(attribute: string, idx: number) : void{
        (this.localAttributes[attribute] as string[]).splice(idx, 1);
    }
}
</script>
