<template>
    <section v-if="localTransition" class="grid-x">
        <div class="cell large-auto">
            <label>Transition to
                <select v-model="localTransition.relationships.target.data.id">
                    <template v-for="target in pages">
                        <option v-if="target.id !== localTransition.relationships.source.data.id" :key="target.id" :value="target.id">{{ target.attributes.name }} ({{ target.attributes.title }})</option>
                    </template>
                </select>
            </label>
        </div>
        <div class="cell large-shrink">
            <aria-menubar v-slot="{ keyboardNav }">
                <ul class="menu vertical sticky top" role="menubar">
                    <li role="presentation">
                        <a role="menuitem" tabindex="-1" aria-label="Save the transition" @keyup="keyboardNav" @click="save">
                            <svg viewBox="0 0 24 24" :class="{'mdi': true, 'icon': true, 'secondary': !hasChanges}">
                                <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
                            </svg>
                        </a>
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
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import deepcopy from 'deepcopy';

import { Transition, StringKeyValueDict, Error } from '@/interfaces';
import AriaMenubar from '@/components/AriaMenubar.vue';
import InputField from '@/components/InputField.vue';

@Component({
    components: {
        InputField,
        AriaMenubar,
    }
})
export default class TransitionEditor extends Vue {
    @Prop() transition!: Transition;
    public localTransition: Transition | null = null;
    public errors: StringKeyValueDict = {};

    public get pages() {
        return Object.values(this.$store.state.pages);
    }

    public get hasChanges() {
        if (this.$props.transition && this.localTransition) {
            return this.$props.transition.relationships.target.data.id != this.localTransition.relationships.target.data.id;
        }
        return false;
    }

    public mounted() {
        this.localTransition = deepcopy(this.$props.transition);
    }

    @Watch('transition')
    public updateTransition() {
        this.localTransition = deepcopy(this.$props.transition);
    }

    public save() {
        if (this.localTransition) {
            try {
                this.errors = {};
                if (!this.localTransition.id) {
                    this.$store.dispatch('createTransition', this.localTransition);
                    this.$emit('created');
                } else {
                    this.$store.dispatch('updateTransition', this.localTransition);
                }
            } catch(error) {
                const errors = {} as StringKeyValueDict;
                error.forEach((entry: Error) => {
                    const pointer = entry.source.pointer.split('/');
                    errors[pointer[pointer.length - 1]] = entry.title;
                });
                this.errors = errors;
            }
        }
    }

    public deleteTransition() {
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
}
</script>
