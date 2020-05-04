<template>
    <div class="grid-x grid-padding-x">
        <div class="cell auto">
            <h2>Add a new page</h2>
            <form @submit.prevent="createPage">
                <input-field type="text" label="Name" v-model="pageName" :error="errors.name"/>
                <input-field type="text" label="Title" v-model="pageTitle" :error="errors.title"/>
                <label>
                    <input type="radio" name="parent" value="first" v-model="addMode" />
                    Add as the first page
                </label>
                <template v-if="hasPages">
                    <label>
                        <input type="radio" name="parent" value="after" v-model="addMode" />
                        Add after
                    </label>
                    <label v-if="addMode === 'after'">
                        <select v-model="parentPageId">
                            <option v-for="page in pages" :value="page.id" :key="page.id">{{ page.attributes.title }}</option>
                        </select>
                    </label>
                </template>
                <div class="buttons">
                    <ul>
                        <li>
                            <a class="button secondary" @click="cancelDialog(false, $event);">Don't add</a>
                        </li>
                        <li>
                            <button class="button primary">Add</button>
                        </li>
                    </ul>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

import InputField from '@/components/InputField.vue';
import { Page, StringKeyValueDict, Error } from '@/interfaces';

@Component({
    components: {
        InputField
    }
})
export default class PagesCreate extends Vue {
    public addMode = 'first';
    public pageName = '';
    public pageTitle = '';
    public parentPageId = '';
    public errors: StringKeyValueDict = {};

    public get pages(): Page[] {
        return Object.values(this.$store.state.pages);
    }

    public get hasPages() {
        return this.pages && this.pages.length > 0;
    }

    public get showPageSelect() {
        return this.hasPages && this.addMode === 'after';
    }

    public mounted() {
        if (this.hasPages) {
            this.addMode = 'after';
            this.parentPageId = this.pages[0].id;
            for (let idx = 0; idx < this.pages.length; idx++) {
                if (this.pages[idx].relationships.next.data.length === 0) {
                    this.parentPageId = this.pages[idx].id;
                    break;
                }
            }
        }
    }

    @Watch('pages')
    public updateAddMode() {
        if (this.hasPages) {
            this.addMode = 'after';
            this.parentPageId = this.pages[0].id;
            for (let idx = 0; idx < this.pages.length; idx++) {
                if (this.pages[idx].relationships.next.data.length === 0) {
                    this.parentPageId = this.pages[idx].id;
                    break;
                }
            }
        } else {
            this.addMode = 'first';
        }
    }

    public cancelDialog(allowParent: boolean, ev: Event) {
        const target = ev.target as HTMLElement;
        if (!allowParent && (target.localName === 'a' || target.localName === 'button')) {
            this.$router.push('/pages');
        } else if (allowParent && target.localName === 'div' && target.classList.contains('dialog-overlay')) {
            this.$router.push('/pages');
        }
    }

    public createPage() {
        if (this.addMode === 'first') {
            this.$store.dispatch('createPage', {
                mode: 'first',
                name: this.pageName,
                title: this.pageTitle,
                errors: (errors: Error[]) => {
                    this.errors = {};
                    errors.forEach((error) => {
                        const pointer = error.source.pointer.split('/');
                        this.errors[pointer[pointer.length - 1]] = error.title;
                    });
                },
            });
        } else {
            this.$store.dispatch('createPage', {
                mode: 'after',
                name: this.pageName,
                title: this.pageTitle,
                parentPageId: this.parentPageId,
                errors: (errors: Error[]) => {
                    this.errors = {};
                    errors.forEach((error) => {
                        const pointer = error.source.pointer.split('/');
                        this.errors[pointer[pointer.length - 1]] = error.title;
                    });
                },
            });
        }
    }
}
</script>
