<template>
    <section v-if="questionType" :id="'question-' + question.id" :class="'question question-type-' + questionType.attributes['_name'] + (error ? ' has-error' : '')">
        <h2 v-if="attributes.title" :class="attributes.required ? 'required' : ''">
            <svg v-if="error" viewBox="0 0 24 24" class="mdi icon alert">
                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            {{ attributes.title }}
        </h2>
        <div v-if="renderType === 'USEFDisplay'" v-html="attributes.content"></div>
        <div v-else-if="renderType === 'USEFSingleLineInput'">
            <label>
                <input :name="'question-' + question.id" type="text" v-model="localValue"/>
            </label>
            <p v-if="error" class="error">
                <span class="label alert">
                    <svg viewBox="0 0 24 24" class="mdi icon small white">
                        <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                    <span>Please answer this question.</span>
                </span>
            </p>
        </div>
        <div v-else-if="renderType === 'USEFMultiLineInput'">
            <label>
                <textarea :name="'question-' + question.id" v-model="localValue"></textarea>
            </label>
            <p v-if="error" class="error">
                <span class="label alert">
                    <svg viewBox="0 0 24 24" class="mdi icon small white">
                        <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                    <span>Please answer this question.</span>
                </span>
            </p>
        </div>
        <div v-else-if="renderType === 'USEFSingleChoice'">
            <ul v-if="attributes.display === 'vertical list'" class="no-bullet">
                <li v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value">
                    <label>
                        <input :name="'question-' + question.id" type="radio" :value="value" v-model="localValue"/> {{ label }}
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
                        <td v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value" scope="col"><label><span class="show-for-sr">{{ label }}</span><input :name="'question-' + question.id" type="radio" :value="value" v-model="localValue"/></label></td>
                    </tr>
                </tbody>
            </table>
            <select v-else :name="'question-' + question.id" v-model="localValue">
                <option v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value" :value="value">{{ label }}</option>
            </select>
            <p v-if="error" class="error">
                <span class="label alert">
                    <svg viewBox="0 0 24 24" class="mdi icon small white">
                        <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                    <span>Please answer this question.</span>
                </span>
            </p>
        </div>
        <div v-else-if="renderType === 'USEFMultiChoice'">
            <ul v-if="attributes.display === 'vertical list'" class="no-bullet">
                <li v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value">
                    <label>
                        <input :name="'question-' + question.id" type="checkbox" :value="value" v-model="localValue"/> {{ label }}
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
                        <td v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value" scope="col"><label><span class="show-for-sr">{{ label }}</span><input :name="'question-' + question.id" type="checkbox" :value="value" v-model="localValue"/></label></td>
                    </tr>
                </tbody>
            </table>
            <select v-else :name="'question-' + question.id" v-model="localValue" multiple>
                <option v-for="[value, label] in zip(attributes.values, attributes.labels)" :key="value" :value="value">{{ label }}</option>
            </select>
            <p v-if="error" class="error">
                <span class="label alert">
                    <svg viewBox="0 0 24 24" class="mdi icon small white">
                        <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                    <span>Please answer this question.</span>
                </span>
            </p>
        </div>
        <div v-else-if="renderType === 'USEFHidden'">
            <input :name="'question-' + question.id" type="hidden" :value="attributes.value"/>
        </div>
        <div v-else-if="renderType === 'USEFSingleChoiceGrid'">
            <table>
                <thead>
                    <th></th>
                    <th v-for="[col, col_label] in zip(attributes.columnValues, attributes.columnLabels)" :key="col" scope="col">{{ col_label }}</th>
                </thead>
                <tbody>
                    <tr v-for="[row, row_label] in zip(attributes.rowValues, attributes.rowLabels)" :key="row" :class="(error && error[row]) ? 'has-error' : ''">
                        <th scope="row">
                            <svg v-if="error && error[row]" viewBox="0 0 24 24" class="mdi icon small alert">
                                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                            </svg>
                            {{ row_label }}
                        </th>
                        <td v-for="[col, col_label] in zip(attributes.columnValues, attributes.columnLabels)" :key="col"><label><span class="show-for-sr">{{ col_label }}</span><input :name="'question-' + question.id + '.' + row" type="radio" :value="col" v-model="value[row]"/></label></td>
                    </tr>
                </tbody>
            </table>
            <p v-if="error" class="error">
                <span class="label alert">
                    <svg viewBox="0 0 24 24" class="mdi icon small white">
                        <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                    <span>Please answer this question.</span>
                </span>
            </p>
        </div>
        <div v-else-if="renderType === 'USEFMultiChoiceGrid'">
            <table>
                <thead>
                    <th></th>
                    <th v-for="[col, col_label] in zip(attributes.columnValues, attributes.columnLabels)" :key="col" scope="col">{{ col_label }}</th>
                </thead>
                <tbody>
                    <tr v-for="[row, row_label] in zip(attributes.rowValues, attributes.rowLabels)" :key="row" :class="(error && error[row]) ? 'has-error' : ''">
                        <th scope="row">
                            <svg v-if="error && error[row]" viewBox="0 0 24 24" class="mdi icon small alert">
                                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                            </svg>
                            {{ row_label }}
                        </th>
                        <td v-for="[col, col_label] in zip(attributes.columnValues, attributes.columnLabels)" :key="col"><label><span class="show-for-sr">{{ col_label }}</span><input :name="'question-' + question.id + '.' + row" type="checkbox" :value="col" v-model="value[row]"/></label></td>
                    </tr>
                </tbody>
            </table>
            <p v-if="error" class="error">
                <span class="label alert">
                    <svg viewBox="0 0 24 24" class="mdi icon small white">
                        <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                    <span>Please answer this question.</span>
                </span>
            </p>
        </div>
        <p v-else-if="renderType === 'USEFInvalid'">This question has an invalid question type and cannot be displayed.</p>
    </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';

import { Question, QuestionTypeAttribute, ResponsesDict, QuestionType } from '@/interfaces';

@Component
export default class QuestionRenderer extends Vue {
    @Prop() question!: Question;
    @Prop() value!: null | string | string[] | ResponsesDict;
    @Prop() error!: null | string;
    localValue: null | string | string[] | ResponsesDict = null;

    public get questionType() : QuestionType {
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
        if (this.questionType && (this.questionType.attributes._name as string).indexOf('USEF') === 0) {
            return (this.questionType.attributes._name as string);
        } else {
            return 'USEFInvalid'
        }
    }

    public mounted() : void {
        this.localValue = deepcopy(this.$props.value);
    }

    @Watch('localValue')
    public valueChange() : void {
        this.$emit('input', this.localValue);
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
