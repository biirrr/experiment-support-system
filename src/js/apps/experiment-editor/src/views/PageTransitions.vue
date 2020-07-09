<template>
    <div>
        <div class="buttons">
            <ul>
                <li><button class="button hollow primary small" @click="addTransition">Add a transition</button></li>
            </ul>
        </div>
        <transition-editor v-for="transition in transitions" :key="transition.id" :transition="transition"/>
        <transition-editor v-if="newTransition" :transition="newTransition" @created="newTransitionCreated"/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { StringKeyValueDict, Transition, TransitionReference, Page } from '@/interfaces';
import TransitionEditor from '@/components/TransitionEditor.vue';

@Component({
    components: {
        TransitionEditor,
    }
})
export default class PageTransitions extends Vue {
    public name = '';
    public title = '';
    public errors: StringKeyValueDict = {};
    public newTransition: Transition | null = null;

    public get page(): Page | null {
        if (this.$store.state.dataStore.data.pages) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const page = this.$store.state.dataStore.data.pages[this.$route.params.pid];
            if (page) {
                return page;
            }
        }
        return null;
    }

    public get transitions() : Transition[] {
        if (this.page && this.page.relationships && this.page.relationships.next && this.$store.state.dataStore.data.transitions) {
            return this.page.relationships.next.data.map((transitionRef: TransitionReference) => {
                return this.$store.state.dataStore.data.transitions[transitionRef.id];
            }).filter((transition: Transition | null) => { return transition; });
        } else {
            return [];
        }
    }

    public addTransition() : void {
        if (this.page) {
            this.newTransition = {
                type: 'transitions',
                attributes: {},
                relationships: {
                    source: {
                        data: {
                            type: 'pages',
                            id: this.page.id,
                        },
                    },
                    target: {
                        data: {
                            type: 'pages',
                            id: '',
                        },
                    },
                },
            };
        }
    }

    public newTransitionCreated() : void {
        this.newTransition = null;
    }
}
</script>
