<template>
  <div>
      <label :class="error ? 'is-invalid-label': ''"><template v-if="labelBefore">{{ label }}</template>
          <textarea v-if="type === 'textarea'" v-model="localValue" :class="error ? 'is-invalid-input': ''"></textarea>
          <input v-else :type="type" v-model="localValue" :class="error ? 'is-invalid-input': ''"/>
          <template v-if="!labelBefore">{{ label }}</template>
          <span v-if="error" class="form-error is-visible">{{ error }}</span>
      </label>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component
export default class InputField extends Vue {
    @Prop() type!: string;
    @Prop() value!: string;
    @Prop() label!: string;
    @Prop() error!: string;

    localValue = '';

    public get labelBefore() : boolean {
        return this.$props.type != 'radio' && this.$props.type != 'checkbox';
    }

    public mounted() : void {
        this.localValue = this.$props.value;
    }

    @Watch('value')
    public updatedValue(newValue: string) : void {
        this.localValue = newValue;
    }

    @Watch('localValue')
    public updateLocalValue(newValue: string) : void {
        if (newValue !== this.$props.value) {
            this.$emit('input', newValue);
        }
    }
}
</script>
