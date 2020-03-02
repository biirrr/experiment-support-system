<template>
  <div>
      <ul class="no-bullet">
          <li v-for="page in pages" :key="page.id">
              <h2>{{ page.attributes.title }}</h2>
          </li>
      </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Pages extends Vue {
    public get pages() {
        return this.$store.state.pages;
    }
}
</script>
