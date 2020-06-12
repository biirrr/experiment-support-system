<template>
    <div id="app">
        <div v-if="progress >= 0" class="busy">
            <progress max="100" :value="progress"/>
            <div v-if="$store.state.ui.busy" class="busy-overlay"></div>
        </div>
        <nav>
            <ul class="menu" role="menubar">
                <li>
                    <select v-model="selectedGroupId">
                        <option v-for="questionTypeGroup in questionTypeGroups" :key="questionTypeGroup.id" :value="questionTypeGroup.id">{{ questionTypeGroup.attributes.title }}</option>
                    </select>
                </li>
            </ul>
        </nav>
        <main v-if="selectedQuestionTypeGroup" class="margin-top">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Label</th>
                        <th>Enabled</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="questionType, idx in questionTypes" :key="questionType.id">
                        <th scope="row">{{ questionType.attributes.essSourceName }}</th>
                        <td>
                            <div class="flex-container">
                                <div class="flex-child-auto">
                                    <input v-if="editing[questionType.id]" type="text" v-model="questionType.attributes.label" />
                                    <template v-else>
                                        {{ questionType.attributes.label }}
                                    </template>
                                </div>
                                <div class="flex-child-shrink">
                                    <ul class="menu" role="menubar">
                                        <template v-if="editing[questionType.id]">
                                            <li role="presentation">
                                                <a role="menuitem" aria-label="Cancel editing the question type" @click="cancel(questionType)">
                                                    <svg class="mdi icon alert" viewBox="0 0 24 24">
                                                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                                                    </svg>
                                                </a>
                                            </li>
                                            <li role="presentation">
                                                <a role="menuitem" aria-label="Save the question type" @click="save(questionType)">
                                                    <svg class="mdi icon success" viewBox="0 0 24 24">
                                                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                                                    </svg>
                                                </a>
                                            </li>
                                        </template>
                                        <li v-else role="presentation">
                                            <a role="menuitem" aria-label="Edit the question type label" @click="edit(questionType)">
                                                <svg class="mdi icon" viewBox="0 0 24 24">
                                                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                                </svg>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="switch">
                                <input class="switch-input" :id="'enabled.' + questionType.id" type="checkbox" v-model="questionType.attributes.essEnabled" @change="save(questionType)">
                                <label class="switch-paddle" :for="'enabled.' + questionType.id">
                                    <span class="show-for-sr">Enable the question</span>
                                </label>
                            </div>
                        </td>
                        <td>
                            <ul class="menu" role="menubar">
                                <li v-if="canMoveUp(idx)" role="presentation">
                                    <a role="menuitem" aria-label="Move up" @click="moveUp(idx)">
                                        <svg class="mdi icon" viewBox="0 0 24 24">
                                            <path d="M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z" />
                                        </svg>
                                    </a>
                                </li>
                                <li v-else role="presentation" class="menu-text">
                                    <svg class="mdi icon medium-gray" viewBox="0 0 24 24">
                                        <path d="M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z" />
                                    </svg>
                                </li>
                                <li v-if="canMoveDown(idx)" role="presentation">
                                    <a role="menuitem" aria-label="Move down" @click="moveDown(idx)">
                                        <svg class="mdi icon" viewBox="0 0 24 24">
                                            <path d="M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z" />
                                        </svg>
                                    </a>
                                </li>
                                <li v-else role="presentation" class="menu-text">
                                    <svg class="mdi icon medium-gray" viewBox="0 0 24 24">
                                        <path d="M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z" />
                                    </svg>
                                </li>
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </main>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Reference, getAll, getSingle, JSONAPIObject } from 'data-store';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import deepcopy from 'deepcopy';

@Component({
    components: {
    },
})
export default class App extends Vue {
    selectedGroupId = '';
    editing = {} as {[x: string]: boolean};

    public get progress(): number {
        if (this.$store.state.ui.busyMaxCounter > 0) {
            return 100 / this.$store.state.ui.busyMaxCounter * (this.$store.state.ui.busyMaxCounter - this.$store.state.ui.busyCounter);
        } else {
            return -1;
        }
    }

    get questionTypeGroups(): JSONAPIObject[] {
        if (this.$store.state.dataStore.data['question-type-groups']) {
            return Object.values(this.$store.state.dataStore.data['question-type-groups']);
        } else {
            return [];
        }
    }

    get selectedQuestionTypeGroup(): JSONAPIObject | null {
        return getSingle(this.$store.dispatch, this.$store.state.dataStore, { type: 'question-type-groups', id: this.selectedGroupId });
    }

    get questionTypes(): JSONAPIObject[] {
        const questionTypeGroup = this.selectedQuestionTypeGroup;
        if (questionTypeGroup) {
            return getAll(this.$store.dispatch, this.$store.state.dataStore, questionTypeGroup.relationships['question-types'].data as Reference[]);
        } else {
            return [];
        }
    }

    mounted(): void {
        const configElement = document.getElementById('QuestionsAdminConfig');
        if (configElement) {
            const config = JSON.parse(configElement.innerHTML);
            if (config) {
                this.$store.dispatch('init', config);
            }
        }
    }

    canMoveUp(idx: number): boolean {
        return idx > 0;
    }

    canMoveDown(idx: number): boolean {
        return idx < this.questionTypes.length - 1;
    }

    cancel(questionType: JSONAPIObject): void {
        Vue.set(this.editing, questionType.id, false);
        this.$store.dispatch('fetchSingle', { type: questionType.type, id: questionType.id });
    }

    save(questionType: JSONAPIObject): void {
        Vue.set(this.editing, questionType.id, false);
        this.$store.dispatch('saveSingle', questionType);
    }

    edit(questionType: JSONAPIObject): void {
        Vue.set(this.editing, questionType.id, true);
    }

    moveUp(idx: number): void {
        const questionTypeGroup = this.selectedQuestionTypeGroup;
        if (questionTypeGroup) {
            const refs = deepcopy(questionTypeGroup.relationships['question-types'].data) as Reference[];
            const deleted = refs.splice(idx, 1);
            refs.splice(idx - 1, 0, deleted[0]);
            questionTypeGroup.relationships['question-types'].data = refs;
            this.$store.dispatch('saveSingle', questionTypeGroup);
        }
    }

    moveDown(idx: number): void {
        const questionTypeGroup = this.selectedQuestionTypeGroup;
        if (questionTypeGroup) {
            const refs = deepcopy(questionTypeGroup.relationships['question-types'].data) as Reference[];
            const deleted = refs.splice(idx, 1);
            refs.splice(idx + 1, 0, deleted[0]);
            questionTypeGroup.relationships['question-types'].data = refs;
            this.$store.dispatch('saveSingle', questionTypeGroup);
        }
    }
}
</script>
