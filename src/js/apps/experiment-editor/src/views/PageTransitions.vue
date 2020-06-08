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

    public get page() : Page {
        return this.$store.state.pages[this.$route.params.pid];
    }

    public get transitions() : Transition[] {
        if (this.page && this.page.relationships && this.page.relationships.next) {
            return this.page.relationships.next.data.map((transitionRef: TransitionReference) => {
                return this.$store.state.transitions[transitionRef.id];
            }).filter((transition: Transition | null) => { return transition; });
        } else {
            return [];
        }
    }

    public addTransition() : void {
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

    public newTransitionCreated() : void {
        this.newTransition = null;
    }
}
</script>
