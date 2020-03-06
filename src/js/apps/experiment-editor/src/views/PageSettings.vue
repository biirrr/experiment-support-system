<template>
  <div>
      <h2>Settings</h2>
      <form v-if="this.page" @submit.prevent="updatePage">
          <label>Name
              <input type="text" v-model="name"/>
          </label>
          <label>Title
              <input type="text" v-model="title"/>
          </label>
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

@Component
export default class PageSettings extends Vue {
    public name = '';
    public title = '';

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
    }

    public updatePage() {
        if (this.page) {
            this.page.attributes.name = this.name;
            this.page.attributes.title = this.title;
            this.$store.dispatch('updatePage', this.page);
        }
    }
}
</script>
