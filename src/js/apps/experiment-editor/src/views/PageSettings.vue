<template>
  <div>
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
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import deepcopy from 'deepcopy';

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
            const page = deepcopy(this.page);
            page.attributes.name = this.name;
            page.attributes.title = this.title;
            this.errors = {};
            this.$store.dispatch('updatePage', {
                page: page,
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
