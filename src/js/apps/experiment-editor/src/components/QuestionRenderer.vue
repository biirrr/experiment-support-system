<template>
    <section v-if="questionType" :id="'question-' + question.id" :class="'question question-type-' + questionType.attributes['_name']">
        <h2 v-if="attributes.title" :class="attributes.required ? 'required' : ''">{{ attributes.title }}</h2>
        <div v-if="renderType === 'USEFDisplay'" v-html="attributes.content"></div>
        <div v-else-if="renderType === 'USEFSingleLineInput'">
            <label>
                <input :name="'question-' + question.id" type="text" />
            </label>
        </div>
        <div v-else-if="renderType === 'USEFMultiLineInput'">
            <label>
                <textarea :name="'question-' + question.id"></textarea>
            </label>
        </div>
        <div v-else-if="renderType === 'USEFSingleChoice'">
            <ul v-if="attributes.display === 'vertical list'" class="no-bullet">
                <li v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value">
                    <label>
                        <input :name="'question-' + question.id" type="radio" :value="value"/> {{ label }}
                    </label>
                </li>
            </ul>
            <table v-else-if="attributes.display === 'horizontal list'" class="no-bullet">
                <thead>
                    <tr>
                        <th v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value" scope="col">{{ label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value" scope="col"><label><span class="show-for-sr">{{ label }}</span><input :name="'question-' + question.id" type="radio" :value="value"/></label></td>
                    </tr>
                </tbody>
            </table>
            <select v-else :name="'question-' + question.id">
                <option v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value" :value="value">{{ label }}</option>
            </select>
        </div>
        <div v-else-if="renderType === 'USEFMultiChoice'">
            <ul v-if="attributes.display === 'vertical list'" class="no-bullet">
                <li v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value">
                    <label>
                        <input :name="'question-' + question.id" type="checkbox" :value="value"/> {{ label }}
                    </label>
                </li>
            </ul>
            <table v-else-if="attributes.display === 'horizontal list'" class="no-bullet">
                <thead>
                    <tr>
                        <th v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value" scope="col">{{ label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value" scope="col"><label><span class="show-for-sr">{{ label }}</span><input :name="'question-' + question.id" type="checkbox" :value="value"/></label></td>
                    </tr>
                </tbody>
            </table>
            <select v-else :name="'question-' + question.id" multiple>
                <option v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value" :value="value">{{ label }}</option>
            </select>
        </div>
        <div v-else-if="renderType === 'USEFHidden'">
            <input :name="'question-' + question.id" type="hidden" :value="attributes.value"/>
        </div>
        <div v-else-if="renderType === 'USEFSingleChoiceGrid'">
            <table>
                <thead>
                    <th></th>
                    <th v-for="[col, col_label] in zip(attributes.column_values, attributes.column_labels)" :key="col" scope="col">{{ col_label }}</th>
                </thead>
                <tbody>
                    <tr v-for="[row, row_label] in zip(attributes.row_values, attributes.row_labels)" :key="row">
                        <th scope="row">{{ row_label }}</th>
                        <td v-for="[col, col_label] in zip(attributes.column_values, attributes.column_labels)" :key="col"><label><span class="show-for-sr">{{ col_label }}</span><input :name="'question-' + question.id + '.' + row" type="radio" :value="col"/></label></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else-if="renderType === 'USEFMultiChoiceGrid'">
            <table>
                <thead>
                    <th></th>
                    <th v-for="[col, col_label] in zip(attributes.column_values, attributes.column_labels)" :key="col" scope="col">{{ col_label }}</th>
                </thead>
                <tbody>
                    <tr v-for="[row, row_label] in zip(attributes.row_values, attributes.row_labels)" :key="row">
                        <th scope="row">{{ row_label }}</th>
                        <td v-for="[col, col_label] in zip(attributes.column_values, attributes.column_labels)" :key="col"><label><span class="show-for-sr">{{ col_label }}</span><input :name="'question-' + question.id + '.' + row" type="checkbox" :value="col"/></label></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p v-else-if="renderType === 'USEFInvalid'">This question has an invalid question type and cannot be displayed.</p>
    </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Question, QuestionType, QuestionTypeAttribute } from '@/interfaces';

@Component
export default class QuestionRenderer extends Vue {
    @Prop() question!: Question;

    public get questionType() : void | QuestionType {
        return this.$store.state.questionTypes[this.$props.question.relationships['question-type'].data.id];
    }

    public get attributes() : {[x: string]: string | boolean | string[] | null} {
        const attributes = {} as {[x: string]: string | boolean | string[] | null};
        if (this.questionType) {
            Object.entries(this.questionType.attributes).forEach((attr) => {
                if (!this.$props.question.attributes[attr[0]]) {
                    if (attr[1] && (attr[1] as QuestionTypeAttribute).source === 'user') {
                        if ((attr[1] as QuestionTypeAttribute).type === 'booleanValue') {
                            attributes[attr[0]] = false;
                        } else if ((attr[1] as QuestionTypeAttribute).type === 'listOfValues') {
                            attributes[attr[0]] = [];
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        } else if ((attr[1] as QuestionTypeAttribute).allowed && (attr[1] as QuestionTypeAttribute).allowed.length > 0) {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

    public get renderType() : string {
        if (this.questionType && (this.questionType.attributes._core_type as string).indexOf('USEF') === 0) {
            return (this.questionType.attributes._core_type as string);
        } else {
            return 'USEFInvalid'
        }
    }

    public zip(valuesA: string[], valuesB: string[]) : [string, string][] {
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
