<template>
  <prism-editor v-model="yaml" :highlight="highlighter"></prism-editor>
</template>

<script>
/* eslint-disable */
/* needed to disable eslint as it would reorganize the lines and prism needs to be loaded in order */
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
import 'prismjs';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles
/* eslint-enable */

import yaml from 'js-yaml';
import { PrismEditor } from 'vue-prism-editor';

export default {
  name: 'Yaml',
  components: {
    PrismEditor,
  },
  props: {
    json: {
      type: Object,
      required: true,
    },
  },
  computed: {
    yaml() {
      return yaml.dump(this.json);
    },
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.yaml); // languages.<insert language> to return html with markup
    },
  },
};
</script>

<style></style>
