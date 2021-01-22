<template>
    <section v-if="localTransition" class="grid-x">
        <div class="cell large-auto margin-bottom-large">
            <label :class="this.errors.id ? 'is-invalid-label': ''">Transition to
                <select v-model="localTransition.relationships.target.data.id" :class="this.errors.id ? 'is-invalid-input': ''">
                    <template v-for="target in pages">
                        <option v-if="target.id !== localTransition.relationships.source.data.id" :key="target.id" :value="target.id">{{ target.attributes.name }} ({{ target.attributes.title }})</option>
                    </template>
                </select>
                <span v-if="this.errors.id" class="form-error is-visible">{{ this.errors.id }}</span>
            </label>
            <label>Transition Condition
                <select v-model="localTransition.attributes.condition">
                    <option value="unconditional">Unconditional</option>
                    <option value="answer">Conditional upon Answer</option>
                </select>
            </label>
            <div v-if="localTransition.attributes.condition === 'answer'" class="grid-x">
                <label class="cell small-3">Page
                    <select v-model="localTransition.attributes.page_id">
                        <option v-for="page in pages" :key="page.id" :value="page.id">{{ page.attributes.name }}<template v-if="page.attributes.title"> ({{ page.attributes.title }})</template></option>
                    </select>
                </label>
                <label class="cell small-3">Question
                    <select v-model="localTransition.attributes.question_id">
                        <option v-for="question in questions" :key="question.id" :value="question.id">{{ question.attributes.essName }}</option>
                    </select>
                </label>
                <label class="cell small-3">Operator
                    <select v-model="localTransition.attributes.operator">
                        <option value="eq">Equals</option>
                        <option value="neq">Not equals</option>
                    </select>
                </label>
                <label class="cell small-3">Value
                    <input type="text" v-model="localTransition.attributes.value"/>
                </label>
            </div>
            <div v-if="!isExistingTransition" class="text-right">
                <button class="button secondary small margin-right" @click="close">Don't add</button>
                <button class="button small" @click="save">Add transition</button>
            </div>
        </div>
        <div v-if="isExistingTransition" class="cell large-shrink">
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
                        <a role="menuitem" tabindex="-1" aria-label="Save the transition" @keyup="keyboardNav" @click="save">
                            <svg viewBox="0 0 24 24" :class="{'mdi': true, 'icon': true, 'secondary': !hasChanges}">
                                <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
                            </svg>
                        </a>
                    </li>
                    <li v-if="canMoveUp" role="presentation">
                        <a role="menuitem" tabindex="-1" aria-label="Move up" @keyup="keyboardNav" @click="moveTransition(-1)">
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
                        <a role="menuitem" tabindex="-1" aria-label="Move down" @keyup="keyboardNav" @click="moveTransition(1)">
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
                        <a role="menuitem" tabindex="-1" aria-label="Delete" @keyup="keyboardNav" @click="deleteTransition">
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

import { Page, Transition, Question, QuestionReference, TransitionReference, StringKeyValueDict } from '@/interfaces';
import AriaMenubar from '@/components/AriaMenubar.vue';
import InputField from '@/components/InputField.vue';

@Component({
    components: {
        InputField,
        AriaMenubar,
    },
    watch: {
        'localTransition.attributes.condition'(newValue) {
            if (newValue === 'unconditional') {
                const self = (this as TransitionEditor);
                if (self.localTransition) {
                    delete self.localTransition.attributes['page_id'];
                    delete self.localTransition.attributes['question_id'];
                    delete self.localTransition.attributes['operator'];
                    delete self.localTransition.attributes['value'];
                }
            }
        }
    }
})
export default class TransitionEditor extends Vue {
    @Prop() transition!: Transition;
    @Prop() page!: Page;
    public localTransition: Transition | null = null;
    public errors: StringKeyValueDict = {};

    public get pages(): Page[] {
        if (this.$store.state.dataStore.data.pages) {
            return Object.values(this.$store.state.dataStore.data.pages);
        } else {
            return [];
        }
    }

    public get questions(): Question[] {
        if (this.$store.state.dataStore.data.questions && this.$store.state.dataStore.data['question-types']) {
            if (this.localTransition && this.localTransition.attributes.condition === 'answer' && this.localTransition.attributes.page_id) {
                const page = this.$store.state.dataStore.data.pages[this.localTransition.attributes.page_id];
                if (page) {
                    return page.relationships.questions.data.map((questionRef: QuestionReference) => {
                        const question = this.$store.state.dataStore.data.questions[questionRef.id];
                        if (question) {
                            const questionType = this.$store.state.dataStore.data['question-types'][question.relationships['question-type'].data.id];
                            if (questionType && questionType.attributes.essCoreType !== 'USEFDisplay') {
                                return question;
                            }
                        }
                        return null;
                    }).filter((question: Question | null) => {
                        return question !== null;
                    });
                }
            }
        }
        return []
    }

    public get hasChanges(): boolean {
        if (this.transition && this.localTransition) {
            return !deepequal(this.transition, this.localTransition);
        }
        return false;
    }

    public get canMoveUp(): boolean {
        if (this.page.relationships.next.data[0].id === this.transition.id) {
            return false;
        } else {
            return true;
        }
    }

    public get canMoveDown(): boolean {
        if (this.page.relationships.next.data[this.page.relationships.next.data.length - 1].id === this.transition.id) {
            return false;
        } else {
            return true;
        }
    }

    public get isExistingTransition(): boolean {
        return this.page.relationships.next.data.reduce((acc: boolean, transitionRef: TransitionReference) => {
            return acc || transitionRef.id === this.transition.id;
        }, false);
    }

    public mounted(): void {
        this.localTransition = deepcopy(this.transition);
    }

    @Watch('transition')
    public updateTransition(): void {
        this.localTransition = deepcopy(this.transition);
    }

    public async save(): Promise<void> {
        if (this.localTransition) {
            try {
                if (!this.localTransition.id) {
                    await this.$store.dispatch('createTransition', this.localTransition);
                    this.$emit('created');
                } else {
                    await this.$store.dispatch('saveTransition', this.localTransition);
                }
            } catch(errors) {
                this.errors = errorsToDict(errors);
            }
        }
    }

    public moveTransition(direction: number) : void {
        const page = deepcopy(this.page);
        let transitionIdx = -1;
        page.relationships.next.data.forEach((transitionRef: QuestionReference, idx: number) => {
            if (transitionRef.id === this.transition.id) {
                transitionIdx = idx;
            }
        });
        if (transitionIdx !== -1) {
            const newIdx = transitionIdx + direction;
            page.relationships.next.data.splice(transitionIdx, 1);
            page.relationships.next.data.splice(newIdx, 0, {
                type: 'transitions',
                id: this.transition.id,
            });
            this.$store.dispatch('savePage', page);
        }
    }

    public deleteTransition(): void {
        if (this.localTransition) {
            if (!this.localTransition.id) {
                this.$emit('created');
            } else {
                if (confirm('Please confirm that you wish to delete this transition?')) {
                    this.$store.dispatch('deleteTransition', this.localTransition);
                }
            }
        }
    }

    public close() : void {
        if (this.hasChanges) {
            if (confirm('This will cause any changes to this transition to be lost. Continue?')) {
                this.$emit('close');
            }
        } else {
            this.$emit('close');
        }
    }
}
</script>
