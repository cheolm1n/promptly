<template>
  <Toast position="bottom-center" class="promptly-toast" />
  <div class="custom-tabmenu">
    <div
      class="tab-item"
      :class="{ active: activeIndex === 0 }"
      @click="activeIndex = 0"
    >
      <i class="pi pi-home icon-spacing"></i>
      <span>MAIN</span>
    </div>
    <div
      class="tab-item"
      :class="{ active: activeIndex === 1 }"
      @click="activeIndex = 1"
    >
      <i class="pi pi-pencil icon-spacing"></i>
      <span>MANAGE</span>
    </div>
  </div>
  <div class="tab-content">
    <MainPage v-if="activeIndex === 0" />
    <PromptManagementPage ref="promptManagementPage" v-else />
  </div>
</template>

<script setup>
import MainPage from './components/MainPage.vue';
import PromptManagementPage from './components/PromptManagementPage.vue';
import {nextTick, ref, useTemplateRef} from "vue";

const activeIndex = ref(0)
const promptManagementPage = useTemplateRef('promptManagementPage')

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "addPrompt" && msg.data !== "") {
    activeIndex.value = 1
    nextTick(() => {
      promptManagementPage.value.handleAddPromptFromContext(msg.data)
    })
  }
});
</script>

<style>
@import 'primeicons/primeicons.css';

#app {
  min-height: 600px;
  width: 400px;
  overflow: hidden;
  position: relative;
}

.promptly-toast {
  --p-toast-width: 90%;
}

.custom-tabmenu {
  display: flex;
  width: 100%;
  cursor: pointer;
}

.tab-item {
  flex: 1;
  padding: 10px;
  text-align: center;
  color: var(--p-button-text-primary-color);
  border-bottom: 2px solid transparent;
  opacity: 0.4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-item i {
  display: flex;
  align-items: center;
}

.tab-item span {
  padding-top: 2px;
}

.tab-item.active {
  color: var(--p-button-text-primary-color);
  border-bottom: 2px solid var(--p-button-text-primary-color);
  opacity: 1;
}

.icon-spacing {
  margin-right: 8px;
}

.tab-content {
  padding: 10px;
}
</style>
