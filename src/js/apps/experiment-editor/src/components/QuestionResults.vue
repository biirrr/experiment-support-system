<template>
    <div>
        <h3>{{ question.attributes.title }}</h3>
        <div v-if="renderType === 'USEFSingleLineInput' || renderType === 'USEFMultiLineInput' || renderType === 'USEFHidden'">
            <table>
                <tbody>
                    <tr v-for="[label, count], idx in results.attributes.responses[question.id]" :key="idx">
                        <th scope="row">{{ label }}</th>
                        <td>{{ count }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else-if="renderType === 'USEFSingleChoice' || renderType === 'USEFMultiChoice'">
            <table>
                <tbody>
                    <tr v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value">
                        <th scope="row">{{ label }}</th>
                        <td v-if="results.attributes.responses[question.id][value]">{{ results.attributes.responses[question.id][value] }}</td>
                        <td v-else>0</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else-if="renderType === 'USEFSingleChoiceGrid' || renderType === 'USEFMultiChoiceGrid'">
            <div v-for="[row, row_label] in zip(attributes.row_values, attributes.row_labels)" :key="row">
                <h4>{{ row_label }}</h4>
                <table>
                    <tbody>
                        <tr v-for="[col, col_label] in zip(attributes.column_values, attributes.column_labels)" :key="col">
                            <th scope="row">{{ col_label }}</th>
                            <td v-if="results.attributes.responses[question.id][row][col]">{{ results.attributes.responses[question.id][row][col] }}</td>
                            <td v-else>0</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <p v-else-if="renderType === 'USEFInvalid'">This question has an invalid question type and cannot be displayed.</p>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Question, QuestionTypeAttribute, Result } from '@/interfaces';

@Component
export default class QuestionResults extends Vue {
    @Prop() question!: Question;
    @Prop() results!: Result;

    public get questionType() {
        return this.$store.state.questionTypes[this.$props.question.relationships['question-type'].data.id];
    }

    public get attributes() {
        const attributes = {} as {[x: string]: string | boolean | string[] | null};
        if (this.questionType) {
            Object.entries(this.questionType.attributes).forEach((attr) => {
                if (!this.$props.question.attributes[attr[0]]) {
                    if (attr[1] && (attr[1] as QuestionTypeAttribute).source === 'user') {
                        if ((attr[1] as QuestionTypeAttribute).type === 'booleanValue') {
                            attributes[attr[0]] = false;
                        } else if ((attr[1] as QuestionTypeAttribute).type === 'listOfValues') {
                            attributes[attr[0]] = [];
                        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                        // @ts-ignore
                        } else if ((attr[1] as QuestionTypeAttribute).allowed && (attr[1] as QuestionTypeAttribute).allowed.length > 0) {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                            // @ts-ignore
                            attributes[attr[0]] = (attr[1] as QuestionTypeAttribute).allowed[0];
                        } else {
                            attributes[attr[0]] = '';
                        }
                    } else {
                        attributes[attr[0]] = null;
                    }
                } else {
                    attributes[attr[0]] = this.$props.question.attributes[attr[0]];
                }
            });
        }
        return attributes;
    }

    public get renderType() {
        if (this.questionType && this.questionType.attributes._core_type.indexOf('USEF') === 0) {
            return this.questionType.attributes._core_type;
        } else {
            return 'USEFInvalid'
        }
    }

    public label(label: string) {
        return label.substring(0, 1).toUpperCase() + label.substring(1);
    }

    public zip(valuesA: string[], valuesB: string[]) {
        return valuesA.map((value, idx) => {
            if (idx < valuesB.length) {
                return [value, valuesB[idx]];
            } else {
                return [value, value];
            }
        });
    }
}
</script>
