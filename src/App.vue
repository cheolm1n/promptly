<template>
    <Toast position="top-center" class="promptly-toast" />
    <div class="tab-header">
      <Button
          text
          label="MAIN"
          @click="activeTab = 'main'"
          :class="{'active': activeTab === 'main'}"
      />
      <Button
          text
          label="MANAGE"
          @click="activeTab = 'manage'"
          :class="{'active': activeTab === 'manage'}"
      />
    </div>
    <div class="tab-content">
      <MainPage v-if="activeTab === 'main'" />
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
      activeTab: 'main',
    };
  },
};
</script>

<style>
#app {
  min-width: 400px;
  min-height: 600px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* 탭 헤더 스타일 */
.tab-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  z-index: 1;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
}

/* 탭 콘텐츠 영역 */
.tab-content {
  position: absolute;
  top: 60px; /* 헤더의 높이만큼 아래로 */
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;
  padding: 10px;
}

/* 선택된 탭 버튼 스타일 */
.tab-header .active,
.tab-header .active:hover {
  font-weight: bold;
  border-bottom: 2px solid var(--p-button-text-primary-color) !important;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  color: var(--p-button-text-primary-color) !important;
}

@media (prefers-color-scheme: dark) {
  #app {
    background-color:#0A0A0B;
  }

  .tab-header {
    background-color: #0A0A0B;
    border-bottom: 1px solid #666;
  }

  .tab-header .active {
    color: #007ad9;
  }
}

.promptly-toast {
  --p-toast-width: 90%;
}
</style>
