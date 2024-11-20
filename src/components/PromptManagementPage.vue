<template>
  <div class="container" v-if="loaded">
    <Textarea v-model="newPrompt" rows="3" cols="30" placeholder="새로운 프롬프트 입력" class="textarea"/>
    <div class="button-group">
      <Button label="프롬프트 추가" @click="addPrompt" class="add-button"/>
      <Menu :model="menuItems" popup ref="menu"/>
      <Button icon="pi pi-bars" class="hamburger-button" @click="$refs.menu.toggle($event)" aria-label="Menu"/>
    </div>

    <input type="file" ref="fileInput" @change="onFileChange" accept=".json" class="import-input"/>

    <Dialog header="프롬프트 가져오기" v-model:visible="dialogVisible" modal>
      <p>기존 프롬프트를 덮어쓰시겠습니까, 아니면 뒤에 추가하시겠습니까?</p>
      <div class="dialog-actions">
        <Button label="덮어쓰기" icon="pi pi-refresh" @click="overwritePrompts"/>
        <Button label="새로 추가" icon="pi pi-plus" @click="appendPrompts"/>
      </div>
    </Dialog>

    <transition-group name="list" tag="ul" class="prompt-list">
      <li v-for="(prompt, index) in prompts" :key="prompt.id" class="prompt-card" @mouseover="hoveredIndex = index" @mouseleave="hoveredIndex = -1">
        <div class="prompt-content">
          <div v-if="editingIndex === index" class="edit-mode">
            <!-- 인라인 편집 모드 (Textarea 사용) -->
            <Textarea v-model="editedPrompt" rows="3" class="input-edit" autoResize/>
            <div class="prompt-actions">
              <Button icon="pi pi-check" class="save-button" @click="saveEditedPrompt(index)" aria-label="Save"/>
              <Button icon="pi pi-times" class="cancel-button" @click="cancelEdit" aria-label="Cancel"/>
            </div>
          </div>
          <div v-else class="view-mode">
            <div class="prompt-text-wrapper">
              <p class="prompt-text">{{ prompt.text }}</p>
              <transition name="fade">
                <div class="prompt-actions-overlay" v-show="hoveredIndex === index">
                  <transition name="fade">
                    <div class="prompt-actions">
                      <Button icon="pi pi-pencil" class="edit-button" @click="editPrompt(index)" aria-label="Edit"/>
                      <Button icon="pi pi-copy" class="duplicate-button" @click="duplicatePrompt(index)" aria-label="Duplicate"/>
                      <Button icon="pi pi-trash" class="delete-button" @click="deletePrompt(index)" aria-label="Delete"/>
                      <Button icon="pi pi-arrow-up" class="move-up-button" @click="movePromptUp(index)" aria-label="Move Up" :disabled="index === 0"/>
                      <Button icon="pi pi-arrow-down" class="move-down-button" @click="movePromptDown(index)" aria-label="Move Down" :disabled="index === prompts.length - 1"/>
                    </div>
                  </transition>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </li>
    </transition-group>
  </div>
  <div v-else>
    <p>로딩 중...</p>
  </div>
</template>

<script>
import {ref} from 'vue';
import {useToast} from 'primevue/usetoast';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';
import useChromeStorage from "../composables/useChromeStorage";

export default {
  name: 'PromptManagementPage',
  components: {
    Menu,
    Dialog,
  },
  setup() {
    const storage = useChromeStorage();
    const newPrompt = ref('');
    const editedPrompt = ref('');
    const editingIndex = ref(-1);
    const fileInput = ref(null);
    const dialogVisible = ref(false);
    const importedPrompts = ref([]);
    const hoveredIndex = ref(-1);

    const toast = useToast();

    // 프롬프트 데이터 구조를 [{ id, text }] 형태로 변경
    const prompts = ref([]);

    // 데이터 로드 완료 상태
    storage.loadPrompts().then(() => {
      prompts.value = storage.prompts.value.map((text, idx) => ({
        id: Date.now() + idx,
        text,
      }));
    })

    const menuItems = [
      {
        label: '프롬프트 내보내기',
        icon: 'pi pi-download',
        command: () => exportPrompts(),
      },
      {
        label: '프롬프트 가져오기',
        icon: 'pi pi-upload',
        command: () => fileInput.value.click(),
      },
    ];

    const addPrompt = () => {
      if (newPrompt.value.trim()) {
        const newId = Date.now();
        prompts.value.push({id: newId, text: newPrompt.value.trim()});
        updateStorePrompts('프롬프트가 추가되었습니다.');
        newPrompt.value = '';
      }
    };

    const editPrompt = (index) => {
      editingIndex.value = index;
      editedPrompt.value = prompts.value[index].text;
    };

    const saveEditedPrompt = (index) => {
      if (editingIndex.value > -1 && editedPrompt.value.trim()) {
        prompts.value[index].text = editedPrompt.value;
        updateStorePrompts('프롬프트가 수정되었습니다.');
        editingIndex.value = -1; // 편집 모드 종료
      }
    };

    const cancelEdit = () => {
      editingIndex.value = -1; // 편집 모드 종료
      editedPrompt.value = ''; // 수정 중인 프롬프트 초기화
    };

    const deletePrompt = (index) => {
      prompts.value.splice(index, 1);
      updateStorePrompts('프롬프트가 삭제되었습니다.');
    };

    const duplicatePrompt = (index) => {
      const promptToDuplicate = {...prompts.value[index], id: Date.now()};
      prompts.value.splice(index + 1, 0, promptToDuplicate); // 선택한 프롬프트 복제 후 바로 다음 위치에 삽입
      updateStorePrompts('프롬프트가 복제되었습니다.');
    };

    const exportPrompts = () => {
      const dataStr = JSON.stringify(prompts.value.map(p => p.text), null, 2);
      const blob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
          now.getDate()
      ).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
          2,
          '0'
      )}${String(now.getSeconds()).padStart(2, '0')}`; // 타임스탬프 생성
      a.href = url;
      a.download = `prompts_${timestamp}.json`; // 파일 이름에 타임스탬프 추가
      a.click();
      URL.revokeObjectURL(url);
    };

    const onFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsedPrompts = JSON.parse(e.target.result);
            if (Array.isArray(parsedPrompts) && parsedPrompts.every((item) => typeof item === 'string')) {
              importedPrompts.value = parsedPrompts;
              dialogVisible.value = true; // 대화창 표시
            } else {
              throw new Error('Invalid format');
            }
          } catch (error) {
            toast.add({
              severity: 'error',
              summary: '오류',
              detail: '유효하지 않은 JSON 형식입니다.',
              life: 1000,
            });
          }
        };
        reader.readAsText(file);
      }
      // 파일 입력 요소 초기화
      event.target.value = null;
    };

    const overwritePrompts = () => {
      prompts.value = importedPrompts.value.map((text, idx) => ({
        id: Date.now() + idx,
        text,
      }));
      updateStorePrompts('프롬프트가 덮어쓰여졌습니다.');
      dialogVisible.value = false;
    };

    const appendPrompts = () => {
      const newPrompts = importedPrompts.value.map((text, idx) => ({
        id: Date.now() + prompts.value.length + idx,
        text,
      }));
      prompts.value.push(...newPrompts);
      updateStorePrompts('프롬프트가 추가되었습니다.');
      dialogVisible.value = false;
    };

    const movePromptUp = (index) => {
      if (index > 0) {
        prompts.value.splice(index - 1, 2, prompts.value[index], prompts.value[index - 1]);
        updateStorePrompts();
      }
    };

    const movePromptDown = (index) => {
      if (index < prompts.value.length - 1) {
        prompts.value.splice(index, 2, prompts.value[index + 1], prompts.value[index]);
        updateStorePrompts();
      }
    };

    const updateStorePrompts = (message) => {
      storage.prompts.value = prompts.value.map((prompt) => prompt.text);
      storage.set({prompts: storage.prompts.value}, () => {
        if (message) {
          toast.add({
            severity: 'success',
            summary: '성공',
            detail: message,
            life: 1000,
          });
        }
      });
    };

    return {
      prompts,
      newPrompt,
      addPrompt,
      editPrompt,
      saveEditedPrompt,
      cancelEdit,
      deletePrompt,
      duplicatePrompt,
      exportPrompts,
      onFileChange,
      overwritePrompts,
      appendPrompts,
      editedPrompt,
      editingIndex,
      menuItems,
      fileInput,
      dialogVisible,
      importedPrompts,
      movePromptUp,
      movePromptDown,
      hoveredIndex,
      loaded: storage.loaded
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 100%;
  padding: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.textarea {
  width: 100%;
  max-width: 600px;
}

.button-group {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin-top: 0.5em;
  position: relative;
}

.add-button {
  flex-grow: 1;
  height: 2.5em;
  /* 버튼 높이 설정 */
}

.hamburger-button {
  width: 2.5em;
  /* 버튼 너비 설정 */
  height: 2.5em;
  /* 버튼 높이 설정 */
  margin-left: 0.5em;
}

.import-input {
  display: none;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1em;
}

.prompt-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  gap: 1em;
  list-style: none;
  padding: 0;
}

.prompt-card {
  padding: 1em;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
  width: 100%;
}

.prompt-content {
  display: flex;
  flex-direction: column;
  position: relative;
}
.prompt-text-wrapper {
  position: relative;
}

.prompt-text {
  margin: 0;
  word-wrap: break-word;
  font-size: 1em;
  padding: 1rem;
}

.prompt-actions-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.prompt-card:hover .prompt-actions-overlay {
  opacity: 1;
}

.prompt-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.prompt-card:hover .prompt-actions {
  opacity: 1;
}

.input-edit {
  width: 100%;
  margin-bottom: 0.5rem;
}

/* 애니메이션 효과 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-active {
  position: absolute;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
