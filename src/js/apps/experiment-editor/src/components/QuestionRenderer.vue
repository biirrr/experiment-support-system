<template>
    <section>
        <h2 v-if="attributes.title" :class="attributes.required ? 'required' : ''">{{ attributes.title }}</h2>
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
export default class QuestionRenderer extends Vue {
    @Prop() question!: Question;

    public get questionType() {
        return this.$store.state.questionTypes[this.$props.question.relationships['question-type'].data.id];
    }

    public get attributes() {
        const attributes = {} as {[x: string]: string | boolean};
        Object.entries(this.questionType.attributes).forEach((attr) => {
            if (this.$props.question.attributes[attr[0]] === undefined) {
                if (attr[1] === '{user:trueFalseValue}') {
                    attributes[attr[0]] = false;
                } else {
                    attributes[attr[0]] = '';
                }
            } else {
                attributes[attr[0]] = this.$props.question.attributes[attr[0]];
            }
        });
        return attributes;
        //return { ...this.questionType.attributes, ...this.$props.question.attributes };
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
