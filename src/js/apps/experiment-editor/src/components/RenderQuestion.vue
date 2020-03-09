<template>
    <section>
        <h2 v-if="attributes.title">{{ attributes.title }}</h2>
        <div v-if="renderType === 'USEFDisplay'" v-html="attributes.content"></div>
        <div v-else-if="renderType === 'USEFSingleLineInput'">
            <label>
                <input type="text" />
            </label>
        </div>
        <p v-else-if="renderType === 'USEFInvalid'">This question has an invalid question type and cannot be displayed.</p>
    </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Question } from '@/interfaces';

@Component
export default class AddQuestion extends Vue {
    @Prop() question!: Question;

    public get questionType() {
        return this.$store.state.questionTypes[this.$props.question.relationships['question-type'].data.id];
    }

    public get attributes() {
        return { ...this.questionType.attributes, ...this.$props.question.attributes };
    }

    public get renderType() {
        if (this.questionType.attributes._name.indexOf('USEF') === 0) {
            return this.questionType.attributes._name;
        } else {
            return 'Fix this'
        }
    }
}
</script>
