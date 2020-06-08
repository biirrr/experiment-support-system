<template>
  <div>
      <form v-if="this.page" @submit.prevent="updatePage">
          <input-field type="text" label="Name" v-model="page.attributes.name" :error="errors.name"/>
          <input-field type="text" label="Title" v-model="page.attributes.title" :error="errors.title"/>
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';

import { StringKeyValueDict, Error, Page } from '@/interfaces';
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

    public get page() : Page {
        return deepcopy(this.$store.state.pages[this.$route.params.pid]);
    }

    public mounted() : void {
        this.errors = {};
    }

    @Watch('page')
    public watchPage() : void {
        this.errors = {};
    }

    public async updatePage() : Promise<void> {
        if (this.page) {
            try {
                this.errors = {}
                await this.$store.dispatch('updatePage', this.page);
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
}
</script>
