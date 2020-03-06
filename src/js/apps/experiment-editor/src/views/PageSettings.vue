<template>
  <div>
      <h2>Settings</h2>
      <form v-if="this.page" @submit.prevent="updatePage">
          <input-field type="text" label="Name" v-model="name" :error="errors.name"/>
          <input-field type="text" label="Title" v-model="title" :error="errors.title"/>
          <div class="buttons">
              <ul>
                  <li>
                      <button class="button primary">Update</button>
                  </li>
              </ul>
          </div>
      </form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

import { StringKeyValueDict, Error } from '@/interfaces';
import InputField from '@/components/InputField.vue';

@Component({
    components: {
        InputField,
    }
})
export default class PageSettings extends Vue {
    public name = '';
    public title = '';
    public errors: StringKeyValueDict = {};

    public get page() {
        return this.$store.state.pages[this.$route.params.pid];
    }

    public mounted() {
        if (this.page) {
            this.name = this.page.attributes.name;
            this.title = this.page.attributes.title;
        }
    }

    @Watch('page')
    public watchPage() {
        if (this.page) {
            this.name = this.page.attributes.name;
            this.title = this.page.attributes.title;
        } else {
            this.name = '';
            this.title = '';
        }
        this.errors = {};
    }

    public updatePage() {
        if (this.page) {
            this.page.attributes.name = this.name;
            this.page.attributes.title = this.title;
            this.errors = {};
            this.$store.dispatch('updatePage', {
                page: this.page,
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
