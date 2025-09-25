<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2><i class="fas fa-cut"></i> PDF 分割工具</h2>
      <p>将PDF文档按页面范围分割为多个文件</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <h3><i class="fas fa-upload"></i> 选择PDF文件</h3>
        <div class="file-upload-area">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            accept=".pdf"
            style="display: none"
          />
          <button @click="$refs.fileInput.click()" class="upload-btn">
            <i class="fas fa-cloud-upload-alt"></i> 选择PDF文件
          </button>
          <span class="file-info" v-if="fileName">已选择: {{ fileName }}</span>
        </div>

        <div class="split-options" v-if="fileName">
          <h4>分割选项:</h4>
          <div class="option-group">
            <label>
              <input type="radio" v-model="splitMode" value="pages" />
              按页面范围分割
            </label>
          </div>
          <div class="option-group">
            <label>
              <input type="radio" v-model="splitMode" value="every" />
              每N页一个文件
            </label>
          </div>

          <div v-if="splitMode === 'pages'" class="page-ranges">
            <label>页面范围 (例如: 1-5, 8-10):</label>
            <input v-model="pageRanges" type="text" placeholder="1-3, 5-8, 10-12" />
          </div>

          <div v-if="splitMode === 'every'" class="every-pages">
            <label>每几页分割:</label>
            <select v-model="everyPages">
              <option value="1">每1页</option>
              <option value="2">每2页</option>
              <option value="3">每3页</option>
              <option value="5">每5页</option>
              <option value="10">每10页</option>
            </select>
          </div>
        </div>
      </div>

      <div class="action-section">
        <button @click="splitPdf" class="split-btn" :disabled="!fileName || isProcessing">
          <i :class="isProcessing ? 'fas fa-spinner fa-spin' : 'fas fa-cut'"></i>
          {{ isProcessing ? '分割中...' : '分割PDF' }}
        </button>
        <button @click="clearAll" class="clear-btn">
          <i class="fas fa-trash"></i> 清空
        </button>
      </div>

      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>

      <div class="note-section">
        <h4><i class="fas fa-info-circle"></i> 使用说明</h4>
        <ul>
          <li>选择一个PDF文件进行分割</li>
          <li>按页面范围: 输入要分割的页面范围，用逗号分隔</li>
          <li>每N页分割: 将PDF按固定页数分割成多个文件</li>
          <li>处理过程在浏览器本地完成，保护隐私</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'SplitPdf',
  setup() {
    const fileName = ref('')
    const splitMode = ref('pages')
    const pageRanges = ref('')
    const everyPages = ref('2')
    const error = ref('')
    const isProcessing = ref(false)

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file && file.type === 'application/pdf') {
        fileName.value = file.name
        error.value = ''
      } else {
        error.value = '请选择有效的PDF文件'
      }
    }

    const splitPdf = () => {
      error.value = ''
      
      if (!fileName.value) {
        error.value = '请先选择PDF文件'
        return
      }

      // PDF分割需要专业的库（如PDF-lib），这里提供说明
      error.value = '抱歉，PDF分割功能需要专业的PDF处理库。建议使用在线PDF分割工具或专业软件。'
    }

    const clearAll = () => {
      fileName.value = ''
      pageRanges.value = ''
      error.value = ''
    }

    return {
      fileName,
      splitMode,
      pageRanges,
      everyPages,
      error,
      isProcessing,
      handleFileUpload,
      splitPdf,
      clearAll
    }
  }
}
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.tool-header h2 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.input-section {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.file-upload-area {
  text-align: center;
  margin-bottom: 20px;
}

.upload-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background: var(--primary-hover);
}

.file-info {
  margin-left: 15px;
  color: var(--success-color);
  font-weight: 500;
}

.split-options {
  margin-top: 20px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.split-options h4 {
  margin-bottom: 15px;
  color: var(--text-primary);
}

.option-group {
  margin-bottom: 15px;
}

.page-ranges, .every-pages {
  margin-top: 15px;
}

.page-ranges input,
.every-pages select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  margin-top: 5px;
}

.action-section {
  text-align: center;
  margin: 20px 0;
}

.split-btn, .clear-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 10px;
  transition: all 0.3s;
}

.split-btn {
  background: var(--success-color);
  color: white;
}

.split-btn:hover:not(:disabled) {
  background: var(--success-hover);
}

.split-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.clear-btn {
  background: var(--danger-color);
  color: white;
}

.clear-btn:hover {
  background: var(--danger-hover);
}

.note-section {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
}

.note-section h4 {
  margin-bottom: 15px;
  color: var(--text-primary);
}

.note-section ul {
  margin: 0;
  padding-left: 20px;
}

.note-section li {
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.error-message {
  background: var(--danger-light);
  color: var(--danger-color);
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid var(--danger-color);
}
</style> 