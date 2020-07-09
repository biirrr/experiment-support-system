<template>
    <form>
        <ul class="vertical menu accordion-menu" data-accordion-menu>
            <template v-for="questionTypeGroup in menuStructure">
                <li v-if="questionTypeGroup.questionTypes.length > 0" :key="questionTypeGroup.id" class="is-accordion-submenu-parent" :aria-expanded="activeGroup === questionTypeGroup.id ? 'true': 'false'">
                    <a @click="setActiveGroup(questionTypeGroup.id)">{{ questionTypeGroup.title }}</a>
                    <ul v-if="activeGroup === questionTypeGroup.id" class="vertical menu nested is-accordion-submenu">
                        <li v-for="questionType in questionTypeGroup.questionTypes" :key="questionType.id"><a v-if="questionType" @click="addQuestion(questionType)">{{ questionType.attributes.label }}</a></li>
                    </ul>
                </li>
            </template>
        </ul>
        <div v-if="canCancel" class="buttons">
            <ul>
                <li><a @click="$emit('close')" class="button secondary small">Don't add</a></li>
            </ul>
        </div>
    </form>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Page, QuestionTypeGroup, QuestionType, AddQuestionMenuStructure } from '@/interfaces';

@Component
export default class AddQuestion extends Vue {
    @Prop() page!: Page;
    @Prop() idx!: number;
    @Prop({ default: false }) canCancel!: boolean;

    public activeGroup = '-1';

    public get menuStructure() : AddQuestionMenuStructure[] {
        if (this.$store.state.dataStore.data['question-type-groups'] && this.$store.state.dataStore.data['question-types']) {
            return (Object.values(this.$store.state.dataStore.data['question-type-groups']) as QuestionTypeGroup[])
                .filter((questionTypeGroup: QuestionTypeGroup) => { return questionTypeGroup.attributes['enabled']})
                .map((questionTypeGroup: QuestionTypeGroup) => {
                    return {
                        id: questionTypeGroup.id,
                        title: questionTypeGroup.attributes.title,
                        questionTypes: questionTypeGroup.relationships['question-types'].data.map((questionTypeReference) => {
                            return this.$store.state.dataStore.data['question-types'][questionTypeReference.id];
                        }).filter((qt) => { return qt && qt.attributes['essEnabled'] }),
                    }
                });
        }
        return [];
    }

    public mounted() : void {
        if (this.menuStructure.length === 1) {
            this.activeGroup = this.menuStructure[0].id;
        }
    }

    public setActiveGroup(questionTypeGroupId: string) : void {
        if (this.activeGroup === questionTypeGroupId) {
            this.activeGroup = '-1';
        } else {
            this.activeGroup = questionTypeGroupId;
        }
    }

    public async addQuestion(questionType: QuestionType) : Promise<void> {
        try {
            await this.$store.dispatch('createQuestion', {
                type: 'questions',
                attributes: {},
                relationships: {
                    page: {
                        data: {
                            type: 'pages',
                            id: this.page.id,
                        },
                    },
                    'question-type': {
                        data: {
                            type: 'question-types',
                            id: questionType.id,
                        },
                    },
                },
            });
            this.$emit('close');
        } catch(error) {
            this.$emit('close');
        }
    }
}
</script>
