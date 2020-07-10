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

import { errorsToDict } from 'data-store';

import { StringKeyValueDict, Page } from '@/interfaces';
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

    public get page(): Page | null {
        if (this.$store.state.dataStore.data.pages) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const page = this.$store.state.dataStore.data.pages[this.$route.params.pid];
            if (page) {
                return deepcopy(page);
            }
        }
        return null;
    }

    public mounted(): void {
        this.errors = {};
    }

    @Watch('page')
    public watchPage(): void {
        this.errors = {};
    }

    public async updatePage(): Promise<void> {
        if (this.page) {
            try {
                this.errors = {}
                await this.$store.dispatch('savePage', this.page);
            } catch(errors) {
                this.errors = errorsToDict(errors);
            }
        }
    }
}
</script>
