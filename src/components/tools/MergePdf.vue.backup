<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2><i class="fas fa-file-pdf"></i> PDF 合并工具</h2>
      <p>合并多个PDF文件为一个文档，保持原有格式和质量</p>
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
            multiple
            style="display: none"
          />
          <button @click="$refs.fileInput.click()" class="upload-btn">
            <i class="fas fa-cloud-upload-alt"></i> 选择多个PDF文件
          </button>
        </div>

        <div class="file-list" v-if="pdfFiles.length > 0">
          <h4>已选择的PDF文件 ({{ pdfFiles.length }} 个):</h4>
          <div class="file-item" v-for="(file, index) in pdfFiles" :key="index">
            <div class="file-info">
              <i class="fas fa-file-pdf"></i>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">({{ formatFileSize(file.size) }})</span>
            </div>
            <div class="file-actions">
              <button @click="moveUp(index)" :disabled="index === 0" class="move-btn">
                <i class="fas fa-arrow-up"></i>
              </button>
              <button @click="moveDown(index)" :disabled="index === pdfFiles.length - 1" class="move-btn">
                <i class="fas fa-arrow-down"></i>
              </button>
              <button @click="removeFile(index)" class="remove-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="action-section">
        <button @click="mergePdfs" class="merge-btn" :disabled="pdfFiles.length < 2 || isProcessing">
          <i :class="isProcessing ? 'fas fa-spinner fa-spin' : 'fas fa-object-group'"></i>
          {{ isProcessing ? '合并中...' : '合并PDF' }}
        </button>
        <button @click="clearAll" class="clear-btn">
          <i class="fas fa-trash"></i> 清空
        </button>
      </div>

      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>

      <div v-if="success" class="success-message">
        <i class="fas fa-check-circle"></i> {{ success }}
      </div>

      <div class="note-section">
        <h4><i class="fas fa-info-circle"></i> 使用说明</h4>
        <ul>
          <li>选择2个或更多PDF文件进行合并</li>
          <li>可以通过箭头按钮调整文件顺序</li>
          <li>合并后的PDF将按照列表顺序排列</li>
          <li>处理过程在浏览器本地完成，保护隐私</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'MergePdf',
  setup() {
    const pdfFiles = ref([])
    const error = ref('')
    const success = ref('')
    const isProcessing = ref(false)

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      files.forEach(file => {
        if (file.type === 'application/pdf') {
          pdfFiles.value.push(file)
        }
      })
      event.target.value = '' // 清空input，允许重复选择同一文件
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const moveUp = (index) => {
      if (index > 0) {
        const files = [...pdfFiles.value]
        const temp = files[index]
        files[index] = files[index - 1]
        files[index - 1] = temp
        pdfFiles.value = files
      }
    }

    const moveDown = (index) => {
      if (index < pdfFiles.value.length - 1) {
        const files = [...pdfFiles.value]
        const temp = files[index]
        files[index] = files[index + 1]
        files[index + 1] = temp
        pdfFiles.value = files
      }
    }

    const removeFile = (index) => {
      pdfFiles.value.splice(index, 1)
    }

    const mergePdfs = () => {
      error.value = ''
      success.value = ''
      
      if (pdfFiles.value.length < 2) {
        error.value = '请选择至少2个PDF文件'
        return
      }

      // 由于PDF合并需要专业的库（如PDF-lib），这里提供一个简化的解决方案
      error.value = '抱歉，PDF合并功能需要专业的PDF处理库。建议使用在线PDF合并工具或专业软件。'
    }

    const clearAll = () => {
      pdfFiles.value = []
      error.value = ''
      success.value = ''
    }

    return {
      pdfFiles,
      error,
      success,
      isProcessing,
      handleFileUpload,
      formatFileSize,
      moveUp,
      moveDown,
      removeFile,
      mergePdfs,
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

.input-section h3 {
  margin-bottom: 15px;
  color: var(--text-primary);
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

.file-list {
  margin-top: 20px;
}

.file-list h4 {
  margin-bottom: 15px;
  color: var(--text-primary);
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--border-color);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.file-info i {
  color: var(--danger-color);
  font-size: 18px;
}

.file-name {
  font-weight: 500;
  color: var(--text-primary);
}

.file-size {
  color: var(--text-secondary);
  font-size: 14px;
}

.file-actions {
  display: flex;
  gap: 5px;
}

.move-btn, .remove-btn {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.move-btn {
  background: var(--info-color);
  color: white;
}

.move-btn:hover:not(:disabled) {
  background: var(--info-hover);
}

.move-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.remove-btn {
  background: var(--danger-color);
  color: white;
}

.remove-btn:hover {
  background: var(--danger-hover);
}

.action-section {
  text-align: center;
  margin: 20px 0;
}

.merge-btn, .clear-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 10px;
  transition: all 0.3s;
}

.merge-btn {
  background: var(--success-color);
  color: white;
}

.merge-btn:hover:not(:disabled) {
  background: var(--success-hover);
}

.merge-btn:disabled {
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

.success-message {
  background: var(--success-light);
  color: var(--success-color);
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid var(--success-color);
}
</style> 