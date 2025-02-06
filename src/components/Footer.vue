<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-left">
        <!-- promptly + 버전 표시 -->
        <span class="footer-link"> promptly v{{ appVersion }} </span>
        <!-- 릴리즈 노트 아이콘 -->
        <a
          v-tooltip.top="getMessage('footerReleaseNote')"
          href="https://github.com/cheolm1n/promptly/releases"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link"
        >
          <i class="pi pi-info-circle icon"></i>
        </a>
      </div>
      <div class="footer-right">
        <!-- 만든이들 아이콘 -->
        <a
          v-tooltip.top="getMessage('footerCredits')"
          href="https://sites.google.com/view/promptly-credits"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link"
        >
          <i class="pi pi-id-card icon"></i>
        </a>

        <!-- 깃헙 아이콘 -->
        <a
          v-tooltip.top="getMessage('footerGithub')"
          href="https://github.com/cheolm1n/promptly"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link"
        >
          <i class="pi pi-github icon"></i>
        </a>

        <!-- 지원 허브 (Chrome Web Store) 아이콘 -->
        <a
          v-tooltip.top="getMessage('footerSupportHub')"
          href="https://chromewebstore.google.com/detail/bkbcjoofjhapaicbfnmalldjahceecjd/support"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link"
        >
          <i class="pi pi-flag icon"></i>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import useI18n from "../composables/useChromeI18n";

const { getMessage } = useI18n();

const appVersion = __APP_VERSION__;
</script>

<style scoped>
.app-footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 30px;
  z-index: 999;
  display: flex;
  background-color: white;
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 1rem; /* 아이템 사이 간격 */
}

/* 아이콘 링크 스타일 */
.footer-link {
  color: #666;
  text-decoration: none;
}

.footer-link:hover {
  color: #222;
}

.icon {
  vertical-align: middle;
}

@media (prefers-color-scheme: dark) {
  .app-footer {
    background-color: #121212;
  }
  .footer-link:hover {
    color: #888;
  }
}
</style>
