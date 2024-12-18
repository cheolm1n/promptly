<template>
  <div class="container">
    <div class="dropdown-container">
      <Select
          :options="prompts"
          optionLabel="text"
          optionValue="value"
          v-model="selectedPrompt"
          :placeholder="getMessage('selectPromptLabel')"
          style="width: 100%; margin-bottom: 1rem;"
          append-to="self"
      />
      <div v-if="variables.length" class="variables-container">
        <div
            v-for="(variable, index) in variables"
            :key="index"
            class="p-field variable-field"
        >
          <label :for="'var_' + index">{{ variable }} {{ getMessage('inputLabel') }}:</label>
          <Textarea
              v-model="userInputs[variable]"
              :id="'var_' + index"
              class="variable-input"
              autoResize
              rows="1"
          />
        </div>
      </div>
    </div>
    <div class="button-container">
      <Button
          :label="getMessage('viewResultLabel')"
          @click="generatePrompt"
          class="result-button"
          :disabled="!selectedPrompt"
      />
    </div>
    <div v-if="filledPrompt" class="p-mt-3">
      <p><strong>{{ getMessage('resultLabel') }}:</strong></p>
      <pre class="result-block">{{ filledPrompt }}</pre>
      <Message :pt="{text: {style: {whiteSpace: 'break-spaces'}}}" v-if="urlLengthAlert" severity="warn">
        {{getMessage('urlLengthWarnMessage')}}
      </Message>
      <div class="button-container">
        <SplitButton
            icon="pi pi-external-link"
            @click="chatWithModel"
            :model="modelOptions"
            style="width: fit-content"
            :pt="{
            pcButton: {
              root: {
                class: 'run-model-button'
              },
            }
          }"
            :class="['p-mt-2', getButtonClass]"
        >
          <span style="display: flex; gap: .25rem">
            <span>
              {{ getMessage('chatWithLabel') }}
            </span>
            <span style="font-weight: bold">{{ getModelLabel(selectedModel) }}</span>
          </span>
        </SplitButton>
        <Button
            :label="getMessage('copyLabel')"
            icon="pi pi-copy"
            iconPos="left"
            @click="copyToClipboard"
            class="p-mt-2 p-button-secondary"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {computed, reactive, ref, watch, onMounted} from 'vue';
import {useToast} from 'primevue/usetoast';
import useChromeStorage from "../composables/useChromeStorage";
import useI18n from "../composables/useChromeI18n";
import {getStringBytes} from "../utils/stringUtils";

export default {
  name: 'MainPage',
  setup() {
    const storage = useChromeStorage();
    const { getMessage } = useI18n();
    const toast = useToast();
    const selectedPrompt = ref(null);
    const variables = ref([]);
    const userInputs = reactive({});
    const filledPrompt = ref('');
    const selectedModel = ref('gpt-4'); // 기본 값 설정
    const urlLengthAlert = ref(false);

    // 모델 옵션들
    const modelOptions = [
      {label: 'ChatGPT 4', model: 'gpt-4'},
      {label: 'ChatGPT 4o', model: 'gpt-4o'},
      {label: 'ChatGPT 4o mini', model: 'gpt-4o-mini'},
      {label: 'ChatGPT 4o with canvas', model: 'gpt-4o-canmore'},
      {label: 'ChatGPT o1-preview', model: 'o1-preview'},
      {label: 'ChatGPT o1-mini', model: 'o1-mini'},
      {separator: true},
      {label: 'Claude 3.5 Sonnet', model: 'Claude 3.5 Sonnet'},
      {separator: true},
      {label: 'Perplexity', model: 'Perplexity'},
    ].map(option => ({
      ...option,
      command: () => selectModel(option.model), // command를 동적으로 생성
    }));

    // 버튼 클래스 계산
    const getButtonClass = computed(() => {
      const model = selectedModel.value.toLowerCase();
      if (model.includes('claude')) {
        return 'p-button-claude';
      } else if (model.includes('perplexity')) {
        return 'p-button-perplexity';
      } else {
        return 'p-button-primary';
      }
    });

    // 모델 선택 함수
    const selectModel = (model) => {
      storage.set({ selectedModel: model })
          .then(() => {
            selectedModel.value = model;
          })
          .catch((error) => {
            console.error('Failed to save selected model:', error);
            toast.add({
              severity: 'error',
              summary: getMessage('error'),
              detail: getMessage('storageSyncErrorMessage'),
              life: 5000,
            });
          });
    };

    // 모델의 라벨을 가져오는 함수
    const getModelLabel = (model) => {
      const option = modelOptions.find(option => option.model === model);
      return option ? option.label : model;
    };

    // 컴포넌트가 마운트될 때 모델을 스토리지에서 불러옴
    onMounted(() => {
      storage.get('selectedModel')
          .then((data) => {
            if (data.selectedModel) {
              selectedModel.value = data.selectedModel;
            }
          })
          .catch((error) => {
            console.error('Failed to load selected model:', error);
          });
    });

    const prompts = computed(() => {
      return storage.prompts.value.map((prompt, index) => ({
        text: prompt,
        value: prompt,
        id: index,
      }));
    });

    watch(selectedPrompt, (newPrompt) => {
      if (newPrompt) {
        const varMatches = newPrompt.match(/{(.*?)}/g);
        variables.value = varMatches
            ? [...new Set(varMatches.map((v) => v.replace(/[{}]/g, '')))]
            : [];
        variables.value.forEach((variable) => {
          userInputs[variable] = '';
        });
        filledPrompt.value = '';
      } else {
        variables.value = [];
      }
    });

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const generatePrompt = () => {
      if (selectedPrompt.value) {
        let tempPrompt = selectedPrompt.value;
        variables.value.forEach((variable) => {
          const value = userInputs[variable] || '';
          const escapedVariable = escapeRegExp(variable);
          tempPrompt = tempPrompt.replace(
              new RegExp(`\\{${escapedVariable}\\}`, 'g'),
              value
          );
        });
        filledPrompt.value = tempPrompt;
        urlLengthAlert.value = getStringBytes(tempPrompt) >= 8000;
      }
    };

    const chatWithModel = () => {
      if (filledPrompt.value) {
        const encodedPrompt = encodeURIComponent(filledPrompt.value);
        const model = selectedModel.value.toLowerCase();
        let url;

        if (model.includes('claude')) {
          url = `https://claude.ai/new?q=${encodedPrompt}`;
        } else if (model.includes('perplexity')) {
          url = `https://perplexity.ai/search?q=${encodedPrompt}`;
        } else {
          url = `https://chat.openai.com/?model=${model}&q=${encodedPrompt}`;
        }

        window.open(url, '_blank');
      }
    };

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(filledPrompt.value);
        toast.add({
          severity: 'success',
          summary: getMessage('success'),
          detail: getMessage('copyToClipboardSuccessMessage'),
          life: 1000,
        });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: getMessage('error'),
          detail: getMessage('copyToClipboardErrorMessage'),
          life: 5000,
        });
      }
    };

    return {
      prompts,
      selectedPrompt,
      variables,
      userInputs,
      generatePrompt,
      filledPrompt,
      chatWithModel,
      copyToClipboard,
      selectedModel,
      modelOptions,
      getButtonClass,
      getModelLabel,
      getMessage,
      urlLengthAlert,
    };
  },
};
</script>

<style scoped>
.p-field {
  margin-top: 1em;
}

.variable-input {
  width: 100%;
  line-height: 1.5em;
  overflow-y: auto !important;
  max-height: calc(1.5em * 3);
}

.dropdown-container {
  margin-bottom: 1.5rem;
}

.variables-container {
  margin-top: 1rem;
}

.variable-field {
  margin-bottom: 1rem;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.result-block {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  border: 1px solid #ddd;
  overflow-x: auto;
}

/* Claude 모델용 버튼 스타일 */
:deep(.p-button-claude) button {
  background: #AB4E1C !important;
  border-color: #AB4E1C !important;
}

:deep(.p-button-claude) button:hover {
  background: #8B3E12 !important;
  border-color: #8B3E12 !important;
}

/* Split 버튼 사이의 구분선 색상도 맞춤 */
:deep(.p-button-claude) button:before {
  border-left-color: rgba(255, 255, 255, 0.3) !important;
}

/* Perplexity 모델용 버튼 스타일 */
:deep(.p-button-perplexity) button {
  background: #6a1b9a !important;
  border-color: #6a1b9a !important;
}

:deep(.p-button-perplexity) button:hover {
  background: #4a148c !important;
  border-color: #4a148c !important;
}

/* Split 버튼 사이의 구분선 색상도 맞춤 */
:deep(.p-button-perplexity) button:before {
  border-left-color: rgba(255, 255, 255, 0.3) !important;
}

@media (prefers-color-scheme: dark) {
  .result-block {
    background-color: #18181b;
    border: 1px solid #18181b;
  }
}

:deep(.run-model-button) {
  width: fit-content;
  font-size: 16px;
  padding-right: .75rem;
  padding-left: .75rem;
}

:deep(.p-select-overlay) {
  width: 100% !important;
}

</style>
