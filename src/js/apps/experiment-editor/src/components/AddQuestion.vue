<template>
  <div>
    <ul class="vertical menu accordion-menu" data-accordion-menu>
        <template v-for="questionTypeGroup, idx in menuStructure">
            <li v-if="questionTypeGroup.questionTypes.length > 0" :key="idx" class="is-accordion-submenu-parent" :aria-expanded="activeGroup === questionTypeGroup.id ? 'true': 'false'">
                <a @click="setActiveGroup(questionTypeGroup.id)">{{ questionTypeGroup.title }}</a>
                <ul v-if="activeGroup === questionTypeGroup.id" class="vertical menu nested is-accordion-submenu">
                    <li v-for="questionType, idx2 in questionTypeGroup.questionTypes" :key="idx2"><a v-if="questionType" @click="addQuestion(questionType)">{{ questionType.attributes._title }}</a></li>
                </ul>
            </li>
        </template>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Page, QuestionTypeGroup, QuestionType } from '@/interfaces';

@Component
export default class AddQuestion extends Vue {
    @Prop() page!: Page;
    @Prop() idx!: number;

    public activeGroup = -1;

    public get menuStructure() {
        return this.$store.state.questionTypeGroups.map((questionTypeGroup: QuestionTypeGroup) => {
            return {
                id: questionTypeGroup.id,
                title: questionTypeGroup.attributes.title,
                questionTypes: questionTypeGroup.relationships['question-types'].data.map((questionType) => {
                    return this.$store.state.questionTypes[questionType.id];
                }),
            }
        });
    }

    public mounted() {
        if (this.menuStructure.length === 1) {
            this.activeGroup = this.menuStructure[0].id;
        }
    }

    public setActiveGroup(questionTypeGroupId: number) {
        if (this.activeGroup === questionTypeGroupId) {
            this.activeGroup = -1;
        } else {
            this.activeGroup = questionTypeGroupId;
        }
    }

    public addQuestion(questionType: QuestionType) {
        this.$store.dispatch('addQuestion', {
            questionType: questionType,
            page: this.$props.page,
            idx: this.$props.idx,
        });
    }
}
</script>
