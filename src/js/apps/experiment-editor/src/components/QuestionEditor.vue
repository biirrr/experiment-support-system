<template>
    <section class="grid-x">
        <div class="cell large-auto">
            <div v-for="attribute, idx in editableAttributes" :key="idx">
                <label v-if="questionType.attributes._name === 'USEFDisplay' && attribute[1] === '{user:singleValue}' && attribute[0] === 'format'">{{ label(attribute[0]) }}
                    <select v-model="localAttributes[attribute[0]]">
                        <option>HTML</option>
                    </select>
                </label>
                <input-field v-else-if="attribute[1] === '{user:singleValue}'" type="text" v-model="localAttributes[attribute[0]]" :label="label(attribute[0])"/>
                <input-field v-else-if="attribute[1] === '{user:trueFalseValue}'" type="checkbox" v-model="localAttributes[attribute[0]]" :label="label(attribute[0])"/>
                <input-field v-else-if="attribute[1] === '{user:multilineText}'" type="textarea" v-model="localAttributes[attribute[0]]" :label="label(attribute[0])"/>
            </div>
        </div>
        <div class="cell large-shrink">
            <aria-menubar v-slot="{ keyboardNav }">
                <ul class="menu vertical" role="menubar">
                    <li role="presentation">
                        <a role="menuitem" tabindex="0" aria-label="Save" @keyup="keyboardNav" @click="close">
                            <svg viewBox="0 0 24 24" class="mdi icon">
                                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                            </svg>
                        </a>
                    </li>
                    <li role="presentation">
                        <a role="menuitem" tabindex="-2" aria-label="Cancel" @keyup="keyboardNav" @click="save">
                            <svg viewBox="0 0 24 24" :class="{'mdi': true, 'icon': true, 'secondary': !hasChanges}">
                                <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
                            </svg>
                        </a>
                    </li>
                    <li v-if="canMoveUp" role="presentation">
                        <a role="menuitem" tabindex="-1" aria-label="Cancel" @keyup="keyboardNav" @click="moveQuestion(-1)">
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
                        <a role="menuitem" tabindex="-1" aria-label="Cancel" @keyup="keyboardNav" @click="moveQuestion(1)">
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
                        <a role="menuitem" tabindex="-1" aria-label="Cancel" @keyup="keyboardNav" @click="deleteQuestion">
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
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import deepcopy from 'deepcopy';

import { Question, StringKeyValueDict, Error, QuestionReference } from '@/interfaces';
import AriaMenubar from '@/components/AriaMenubar.vue';
import InputField from '@/components/InputField.vue';

@Component({
    components: {
        InputField,
        AriaMenubar,
    }
})
export default class QuestionEditor extends Vue {
    @Prop() question!: Question;
    public localAttributes = {} as {[x: string]: string | boolean};
    public errors: StringKeyValueDict = {};


    public get questionType() {
        return this.$store.state.questionTypes[this.$props.question.relationships['question-type'].data.id];
    }

    public get editableAttributes() {
        return Object.entries(this.questionType.attributes).filter((value) => {
            return value[1] === '{user:singleValue}' || value[1] === '{user:multilineText}' || value[1] === '{user:trueFalseValue}';
        });
    }

    public get attributes() {
        return { ...this.questionType.attributes, ...this.$props.question.attributes };
    }

    public get hasChanges() {
        let changes = false;
        Object.entries(this.localAttributes).forEach(([key, value]) => {
            if (this.$props.question.attributes[key] !== value) {
                changes = true;
            }
        });
        return changes;
    }

    public get canMoveUp() {
        const page = this.$store.state.pages[this.$props.question.relationships.page.data.id];
        if (page.relationships.questions.data[0].id === this.$props.question.id) {
            return false;
        }
        return true;
    }

    public get canMoveDown() {
        const page = this.$store.state.pages[this.$props.question.relationships.page.data.id];
        if (page.relationships.questions.data[page.relationships.questions.data.length - 1].id === this.$props.question.id) {
            return false;
        }
        return true;
    }

    public label(label: string) {
        return label.substring(0, 1).toUpperCase() + label.substring(1);
    }

    public mounted() {
        this.localAttributes = deepcopy(this.$props.question.attributes);
        this.editableAttributes.forEach((attr) => {
            if (!this.localAttributes[attr[0]]) {
                if (attr[1] === '{user:trueFalseValue}') {
                    this.localAttributes[attr[0]] = false;
                } else {
                    this.localAttributes[attr[0]] = '';
                }
            }
        });
    }

    @Watch('question')
    public updateQuestion() {
        this.localAttributes = deepcopy(this.$props.question.attributes);
        this.editableAttributes.forEach((attr) => {
            if (!this.localAttributes[attr[0]]) {
                if (attr[1] === '{user:trueFalseValue}') {
                    this.localAttributes[attr[0]] = 'false';
                } else {
                    this.localAttributes[attr[0]] = '';
                }
            }
        });
    }

    public save() {
        const question = deepcopy(this.$props.question);
        question.attributes = this.localAttributes;
        this.$store.dispatch('updateQuestion', {
            question: question,
            errors: (errors: Error[]) => {
                this.errors = {};
                errors.forEach((error) => {
                    const pointer = error.source.pointer.split('/');
                    this.errors[pointer[pointer.length - 1]] = error.title;
                });
            },
        });
    }

    public close() {
        if (this.hasChanges) {
            if (confirm('This will cause any changes to this question to be lost. Continue?')) {
                this.$emit('close');
            }
        } else {
            this.$emit('close');
        }
    }

    public moveQuestion(direction: number) {
        const page = deepcopy(this.$store.state.pages[this.$props.question.relationships.page.data.id]);
        let questionIdx = -1;
        page.relationships.questions.data.forEach((questionRef: QuestionReference, idx: number) => {
            if (questionRef.id === this.$props.question.id) {
                questionIdx = idx;
            }
        });
        if (questionIdx !== -1) {
            const newIdx = questionIdx + direction;
            page.relationships.questions.data.splice(questionIdx, 1);
            page.relationships.questions.data.splice(newIdx, 0, {
                type: 'questions',
                id: this.$props.question.id,
            });
            this.$store.dispatch('updatePage', { page: page });
        }
    }

    public deleteQuestion() {
        if (confirm('Please confirm that you wish to delete this question?')) {
            this.$store.dispatch('deleteQuestion', {question: this.$props.question});
        }
    }
}
</script>
