<template>
    <div>
        <p>
            <router-link to="/" v-slot="{ href, navigate }">
                <a :href="href" @click="navigate">&larr; Back to all question sets</a>
            </router-link>
        </p>
        <template v-if="questionTypeGroup">
            <h2>{{ questionTypeGroup.attributes.title }}</h2>
            <table>
                <thead>
                    <th scope="col">Identifier</th>
                    <th scope="col">Label</th>
                    <th scope="col">Show to the user</th>
                    <th scope="col">Action</th>
                </thead>
                <tbody>
                    <tr v-for="(questionType, idx) in questionTypes" :key="questionType.id">
                        <th scope="row">{{ questionType.attributes._name }}</th>
                        <td>
                            <template v-if="editing.indexOf(idx) < 0">
                                {{ questionType.attributes.label }}
                            </template>
                            <template v-else>
                                <input type="text" v-model="questionType.attributes.label"/>
                            </template>
                        </td>
                        <td>
                            <div class="switch tiny">
                                <input class="switch-input" :id="'enabled-' + questionType.id" type="checkbox" v-model="questionType.attributes._enabled" @change="updateQuestionType(questionType)">
                                <label class="switch-paddle" :for="'enabled-' + questionType.id">
                                    <span class="show-for-sr">Question enabled?</span>
                                    <span class="switch-active" aria-hidden="true">Yes</span>
                                    <span class="switch-inactive" aria-hidden="true">No</span>
                                </label>
                            </div>
                        </td>
                        <td>
                            <aria-menubar v-slot="{ keyboardNav }">
                                <ul class="menu" role="menubar">
                                    <li v-if="editing.indexOf(idx) < 0" role="presentation">
                                        <a role="menuitem" tabindex="0" aria-label="Edit" @keyup="keyboardNav" @click="toggleEditing(idx)">
                                            <svg viewBox="0 0 24 24" class="mdi icon">
                                                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                            </svg>
                                        </a>
                                    </li>
                                    <template v-else>
                                        <li role="presentation">
                                            <a role="menuitem" tabindex="0" aria-label="Save changes" @keyup="keyboardNav" @click="updateQuestionType(questionType); toggleEditing(idx)">
                                                <svg viewBox="0 0 24 24" class="mdi icon success">
                                                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                                                </svg>
                                            </a>
                                        </li>
                                        <li role="presentation">
                                            <a role="menuitem" tabindex="0" aria-label="Cancel changes" @keyup="keyboardNav" @click="resetQuestionType(questionType); toggleEditing(idx)">
                                                <svg viewBox="0 0 24 24" class="mdi icon alert">
                                                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                                                </svg>
                                            </a>
                                        </li>
                                    </template>
                                    <li v-if="idx > 0" role="presentation">
                                        <a role="menuitem" tabindex="0" aria-label="Move Up" @keyup="keyboardNav" @click="moveQuestionType(questionType, -1)">
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
                                    <li v-if="idx < questionTypes.length - 1" role="presentation">
                                        <a role="menuitem" tabindex="0" aria-label="Move Down" @keyup="keyboardNav" @click="moveQuestionType(questionType, 1)">
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
                                        <a role="menuitem" tabindex="0" aria-label="Delete" @keyup="keyboardNav" @click="deleteQuestionType(questionType)">
                                            <svg viewBox="0 0 24 24" class="mdi icon alert">
                                                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                                            </svg>
                                        </a>
                                    </li>
                                </ul>
                            </aria-menubar>
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';

import AriaMenubar from '@/components/AriaMenubar.vue';
import { QuestionTypeGroup as IQuestionTypeGroup, QuestionType, QuestionTypeReference } from '@/interfaces';

@Component({
    components: {
        AriaMenubar,
    }
})
export default class QuestionTypeGroup extends Vue {
    public editing = [] as number[];

    public get questionTypeGroup() : IQuestionTypeGroup {
        return this.$store.state.questionTypeGroups[this.$route.params["qtgid"]];
    }

    public get questionTypes() : QuestionType[] {
        if (this.questionTypeGroup) {
            return this.questionTypeGroup.relationships['question-types'].data.map((qtr: QuestionTypeReference) => {
                if (this.$store.state.questionTypes[qtr.id]) {
                    return deepcopy(this.$store.state.questionTypes[qtr.id]);
                } else {
                    return null;
                }
            }).filter((qt: QuestionType | null) => { return qt; });
        } else {
            return [];
        }
    }

    public async moveQuestionType(questionType: QuestionType, direction: number) : Promise<void> {
        const questionTypeGroup = deepcopy(this.$store.state.questionTypeGroups[questionType.relationships['question-type-group'].data.id]);
        let questionTypeIdx = -1;
        questionTypeGroup.relationships['question-types'].data.forEach((questionTypeRef: QuestionTypeReference, idx: number) => {
            if (questionTypeRef.id === questionType.id) {
                questionTypeIdx = idx;
            }
        });
        if (questionTypeIdx !== -1) {
            const newIdx = questionTypeIdx + direction;
            questionTypeGroup.relationships['question-types'].data.splice(questionTypeIdx, 1);
            questionTypeGroup.relationships['question-types'].data.splice(newIdx, 0, {
                type: 'question-types',
                id: questionType.id,
            });
            await this.$store.dispatch('updateQuestionTypeGroup', questionTypeGroup);
        }
    }

    public async updateQuestionType(questionType: QuestionType) : Promise<void> {
        await this.$store.dispatch('updateQuestionType', questionType);
    }

    public toggleEditing(idx: number) : void {
        if (this.editing.indexOf(idx) < 0) {
            this.editing.push(idx);
        } else {
            this.editing.splice(this.editing.indexOf(idx), 1);
        }
    }

    public resetQuestionType(questionType: QuestionType) : void {
        questionType.attributes._title = this.$store.state.questionTypes[questionType.id].attributes._title;
    }

    public async deleteQuestionType(questionType: QuestionType) : Promise<void> {
        try {
            await this.$store.dispatch('deleteQuestionType', questionType);
        } catch(error) {
            alert('This question type or a derived question type are in use and thus the question cannot be deleted');
        }
    }
}
</script>
