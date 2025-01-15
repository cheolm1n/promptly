<template>
  <div v-if="storage.loaded" class="container">
    <InputText
      v-model="newTitle"
      class="new-title-input"
      :placeholder="getMessage('addPromptTitlePlaceholder')"
    />
    <Textarea
      v-model="newPrompt"
      rows="3"
      cols="30"
      :placeholder="getMessage('addPromptLabelPlaceholder')"
      class="textarea"
      auto-resize
    />
    <div class="button-group">
      <Button
        :label="getMessage('addPromptLabel')"
        class="add-button"
        @click="addPrompt"
      />
      <Menu ref="menu" :model="menuItems" popup />
      <Button
        icon="pi pi-bars"
        class="hamburger-button"
        :aria-label="getMessage('menuLabel')"
        @click="$refs.menu?.toggle($event)"
      />
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="import-input"
      @change="onFileChange"
    />

    <Dialog
      v-model:visible="dialogVisible"
      :header="getMessage('importPromptLabel')"
      modal
    >
      <p>{{ getMessage("overwriteConfirmationMessage") }}</p>
      <div class="dialog-actions">
        <Button
          :label="getMessage('overwritePromptLabel')"
          icon="pi pi-refresh"
          style="margin-right: 1rem"
          @click="overwritePrompts"
        />
        <Button
          :label="getMessage('appendPromptLabel')"
          icon="pi pi-plus"
          @click="appendPrompts"
        />
      </div>
    </Dialog>

    <transition-group name="list" tag="ul" class="prompt-list">
      <li
        v-for="(prompt, index) in prompts"
        :key="prompt.id"
        class="prompt-card"
        @mouseover="hoveredIndex = index"
        @mouseleave="hoveredIndex = -1"
      >
        <div class="prompt-content">
          <div v-if="editingIndex === index" class="edit-mode">
            <InputText v-model="editedTitle" class="title-edit" />
            <Textarea
              v-model="editedPrompt"
              rows="3"
              class="input-edit"
              auto-resize
            />
            <div class="prompt-actions">
              <Button
                icon="pi pi-check"
                class="save-button"
                :aria-label="getMessage('saveLabel')"
                @click="saveEditedPrompt(index)"
              />
              <Button
                icon="pi pi-times"
                class="cancel-button"
                :aria-label="getMessage('cancelLabel')"
                @click="cancelEdit"
              />
            </div>
          </div>
          <div v-else class="view-mode">
            <div class="prompt-text-wrapper">
              <p class="prompt-title">{{ prompt.title }}</p>
              <p class="prompt-text">{{ prompt.text }}</p>
              <transition name="fade">
                <div
                  v-show="hoveredIndex === index"
                  class="prompt-actions-overlay"
                >
                  <transition name="fade">
                    <div class="prompt-actions">
                      <Button
                        icon="pi pi-play"
                        class="use-button"
                        :aria-label="getMessage('usePromptLabel')"
                        @click="usePrompt(index)"
                      />
                      <Button
                        icon="pi pi-pencil"
                        class="edit-button"
                        :aria-label="getMessage('editLabel')"
                        @click="editPrompt(index)"
                      />
                      <Button
                        icon="pi pi-copy"
                        class="duplicate-button"
                        :aria-label="getMessage('duplicateLabel')"
                        @click="duplicatePrompt(index)"
                      />
                      <Button
                        icon="pi pi-trash"
                        class="delete-button"
                        :aria-label="getMessage('deleteLabel')"
                        @click="deletePrompt(index)"
                      />
                      <Button
                        icon="pi pi-arrow-up"
                        class="move-up-button"
                        :aria-label="getMessage('moveUpLabel')"
                        :disabled="index === 0"
                        @click="movePromptUp(index)"
                      />
                      <Button
                        icon="pi pi-arrow-down"
                        class="move-down-button"
                        :aria-label="getMessage('moveDownLabel')"
                        :disabled="index === prompts.length - 1"
                        @click="movePromptDown(index)"
                      />
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
    <p>{{ getMessage("loadingMessage") }}</p>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, toRaw, useTemplateRef } from "vue";
import { useToast } from "primevue/usetoast";
import useChromeStorage from "../composables/useChromeStorage";
import useI18n from "../composables/useChromeI18n";
import {
  addId,
  convertImportedPrompt,
  convertPromptToExport,
  convertPromptToStore,
  updatePrompt,
} from "../utils/promptConverter";
import { nanoid } from "nanoid";
import {
  InitialPromptData,
  PromptData,
  PromptDataWithId,
} from "../types/prompt";

defineComponent({ name: "PromptManagementPage" });
const emit = defineEmits<{
  (e: "usePrompt", payload: PromptDataWithId): void;
}>();

const storage = useChromeStorage();
const { getMessage } = useI18n();
const newTitle = ref("");
const newPrompt = ref("");
const editedTitle = ref("");
const editedPrompt = ref("");
const editingIndex = ref(-1);
const fileInput = useTemplateRef<HTMLInputElement>("fileInput");
const dialogVisible = ref(false);
const importedPrompts = ref<Array<InitialPromptData | PromptData>>([]);
const hoveredIndex = ref(-1);

const toast = useToast();

const prompts = ref<PromptDataWithId[]>([]);

// 데이터 로드 완료 상태
storage.loadPrompts().then(() => {
  prompts.value = storage.prompts.value.map(updatePrompt).map(addId);
});

const menuItems = [
  {
    label: getMessage("exportPrompt"),
    icon: "pi pi-download",
    command: () => exportPrompts(),
  },
  {
    label: getMessage("importPrompt"),
    icon: "pi pi-upload",
    command: () => fileInput.value?.click(),
  },
];

const addPrompt = () => {
  if (newPrompt.value.trim() && newTitle.value.trim()) {
    const newPromptObj = {
      id: nanoid(),
      text: newPrompt.value.trim(),
      title: newTitle.value.trim(),
    };
    const newPrompts = prompts.value.concat(newPromptObj);

    updateStorePrompts(newPrompts, getMessage("addPromptMessage"))
      .then(() => {
        prompts.value.push(newPromptObj);
        console.log("Prompt added successfully");
      })
      .catch((error) => {
        console.error("Failed to add prompt:", error);
      });
    newPrompt.value = "";
    newTitle.value = "";
  }
};

const usePrompt = (index: number) => {
  const prompt = toRaw(prompts.value[index]);
  emit("usePrompt", prompt);
};

const editPrompt = (index: number) => {
  editingIndex.value = index;
  editedPrompt.value = prompts.value[index].text;
  editedTitle.value = prompts.value[index].title;
};

const saveEditedPrompt = (index: number) => {
  if (editingIndex.value > -1 && editedPrompt.value.trim()) {
    const updatedPrompt = {
      ...prompts.value[index],
      text: editedPrompt.value.trim(),
      title: editedTitle.value.trim(),
    };
    const newPrompts = prompts.value.slice();
    newPrompts.splice(index, 1, updatedPrompt);

    updateStorePrompts(newPrompts, getMessage("updatePromptMessage"))
      .then(() => {
        prompts.value[index] = updatedPrompt;
        editingIndex.value = -1;
        console.log("Prompt updated successfully");
      })
      .catch((error) => {
        console.error("Failed to update prompt:", error);
      });
  }
};

const cancelEdit = () => {
  editingIndex.value = -1; // 편집 모드 종료
  editedPrompt.value = ""; // 수정 중인 프롬프트 초기화
  editedTitle.value = ""; // 수정 중인 프롬프트 초기화
};

const deletePrompt = (index: number) => {
  const newPrompts = prompts.value.slice();
  newPrompts.splice(index, 1);

  updateStorePrompts(newPrompts, getMessage("deletePromptMessage"))
    .then(() => {
      prompts.value.splice(index, 1);
      console.log("Prompt deleted successfully");
    })
    .catch((error) => {
      console.error("Failed to delete prompt:", error);
    });
};

const duplicatePrompt = (index: number) => {
  const promptToDuplicate = {
    ...prompts.value[index],
    id: nanoid(),
  };
  const newPrompts = prompts.value.slice();
  newPrompts.splice(index + 1, 0, promptToDuplicate);

  updateStorePrompts(newPrompts, getMessage("duplicatePromptMessage"))
    .then(() => {
      prompts.value.splice(index + 1, 0, promptToDuplicate);
      console.log("Prompt duplicated successfully");
    })
    .catch((error) => {
      console.error("Failed to duplicate prompt:", error);
    });
};

const exportPrompts = () => {
  const dataStr = JSON.stringify(
    prompts.value.map(convertPromptToExport),
    null,
    2,
  );
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes(),
  ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`; // 타임스탬프 생성
  a.href = url;
  a.download = `prompts_${timestamp}.json`; // 파일 이름에 타임스탬프 추가
  a.click();
  URL.revokeObjectURL(url);
};

const showJsonValidationError = () => {
  toast.add({
    severity: "error",
    summary: getMessage("error"),
    detail: getMessage("jsonValidationErrorMessage"),
    life: 5000,
  });
};
const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target?.result) {
        showJsonValidationError();
        return;
      }
      const parsedPrompts = JSON.parse(e.target.result as string);
      if (!Array.isArray(parsedPrompts)) {
        showJsonValidationError();
        return;
      }
      importedPrompts.value = parsedPrompts;
      dialogVisible.value = true; // 대화창 표시
    };
    reader.readAsText(file);
  }
  // 파일 입력 요소 초기화
  input.value = null;
};

const overwritePrompts = () => {
  const newPrompts = importedPrompts.value
    .map(convertImportedPrompt)
    .map(addId);

  updateStorePrompts(newPrompts, getMessage("overwritePromptMessage"))
    .then(() => {
      prompts.value = newPrompts;
      console.log("Prompts overwritten successfully");
    })
    .catch((error) => {
      console.error("Failed to overwrite prompts:", error);
    });
  dialogVisible.value = false;
};

const appendPrompts = () => {
  const importedWithIds = importedPrompts.value
    .map(convertImportedPrompt)
    .map(addId);
  const newPrompts = prompts.value.concat(importedWithIds);

  updateStorePrompts(newPrompts, getMessage("appendPromptMessage"))
    .then(() => {
      prompts.value = newPrompts;
      console.log("Prompts appended successfully");
    })
    .catch((error) => {
      console.error("Failed to append prompts:", error);
    });
  dialogVisible.value = false;
};

const movePromptUp = (index: number) => {
  if (index > 0) {
    const newPrompts = prompts.value.slice();
    [newPrompts[index - 1], newPrompts[index]] = [
      newPrompts[index],
      newPrompts[index - 1],
    ];

    updateStorePrompts(newPrompts)
      .then(() => {
        [prompts.value[index - 1], prompts.value[index]] = [
          prompts.value[index],
          prompts.value[index - 1],
        ];
        console.log("Prompt moved up successfully");
      })
      .catch((error) => {
        console.error("Failed to move prompt up:", error);
      });
  }
};

const movePromptDown = (index: number) => {
  if (index < prompts.value.length - 1) {
    const newPrompts = prompts.value.slice();
    [newPrompts[index], newPrompts[index + 1]] = [
      newPrompts[index + 1],
      newPrompts[index],
    ];

    updateStorePrompts(newPrompts)
      .then(() => {
        [prompts.value[index], prompts.value[index + 1]] = [
          prompts.value[index + 1],
          prompts.value[index],
        ];
        console.log("Prompt moved down successfully");
      })
      .catch((error) => {
        console.error("Failed to move prompt down:", error);
      });
  }
};

const updateStorePrompts = async (
  newPrompts: PromptData[],
  message?: string,
) => {
  const promptsTexts = newPrompts.map(convertPromptToStore);
  try {
    await storage.set({ prompts: promptsTexts });
    if (message) {
      toast.add({
        severity: "success",
        summary: getMessage("success"),
        detail: message,
        life: 1000,
      });
    }
  } catch (error) {
    console.error("Storage set error:", error);
    toast.add({
      severity: "error",
      summary: getMessage("error"),
      detail: getMessage("storageSyncErrorMessage"),
      life: 5000,
    });
    throw error;
  }
};

function handleAddPromptFromContext(prompt: string) {
  storage.loadPrompts().then(() => {
    newPrompt.value = prompt;
  });
}

defineExpose({
  handleAddPromptFromContext,
});
</script>

<style scoped>
.new-title-input {
  width: 100%;
  margin-bottom: 0.5rem;
}

.textarea {
  width: 100%;
  max-height: 30em;
}

.button-group {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 0.5em;
  position: relative;
}

.add-button {
  flex-grow: 1;
  height: 2.5em;
}

.hamburger-button {
  width: 2.5em;
  height: 2.5em;
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

.prompt-title {
  font-weight: bold;
  margin-top: 0;
}

.prompt-text {
  margin: 0;
  word-wrap: break-word;
  font-size: 1em;
  padding: 0.25rem 1rem 1rem 1rem;
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
  gap: 0.75rem;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.prompt-card:hover .prompt-actions {
  opacity: 1;
}

.title-edit {
  width: 100%;
  margin-bottom: 0.5rem;
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

@media (prefers-color-scheme: dark) {
  .prompt-card {
    background-color: #18181b;
    border: 1px solid #18181b;
  }

  .prompt-actions-overlay {
    background-color: rgba(24, 24, 27, 0.7);
  }
}
</style>
