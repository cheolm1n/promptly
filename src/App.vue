<template>
  <Toast position="top-center" class="promptly-toast" />
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
    <PromptManagementPage v-else />
  </div>
</template>

<script>
import MainPage from './components/MainPage.vue';
import PromptManagementPage from './components/PromptManagementPage.vue';

export default {
  name: 'App',
  components: {
    MainPage,
    PromptManagementPage,
  },
  data() {
    return {
      activeIndex: 0,
    };
  },
};
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
