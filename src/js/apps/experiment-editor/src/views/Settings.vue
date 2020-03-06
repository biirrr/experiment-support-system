<template>
  <div class="grid-x grid-padding-x">
      <div class="cell auto">
          <form @submit.prevent="updateExperiment">
              <input-field type="text" label="Title" v-model="title" :error="errors.title"/>
              <input-field type="textarea" label="Description" v-model="description" :error="errors.description"/>
              <div class="buttons">
                  <ul>
                      <li>
                          <button class="button primary">Update</button>
                      </li>
                  </ul>
              </div>
          </form>
      </div>
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
export default class Settings extends Vue {
    public title = '';
    public description = '';
    public errors: StringKeyValueDict = {};

    public get experiment() {
        return this.$store.state.experiment;
    }

    public mounted() {
        if (this.experiment) {
            this.title = this.experiment.attributes.title;
            this.description = this.experiment.attributes.description;
        }
    }

    @Watch('experiment')
    public watchExperiment() {
        if (this.experiment) {
            this.title = this.experiment.attributes.title;
            this.description = this.experiment.attributes.description;
        }
    }

    public updateExperiment() {
        if (this.experiment) {
            const experiment = deepcopy(this.experiment);
            experiment.attributes.title = this.title;
            experiment.attributes.description = this.description;
            this.errors = {};
            this.$store.dispatch('updateExperiment', {
                experiment: experiment,
                errors: (errors: Error[]) => {
                    this.errors = {};
                    errors.forEach((error) => {
                        const pointer = error.source.pointer.split('/');
                        this.errors[pointer[pointer.length - 1]] = error.title;
                    });
                },
            })
        }
    }
}
</script>
