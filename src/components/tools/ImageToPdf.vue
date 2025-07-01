<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2><i class="fas fa-images"></i> 图片转 PDF</h2>
      <p>将多张图片合并为一个PDF文档</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <h3><i class="fas fa-upload"></i> 选择图片</h3>
        <div class="file-upload-area">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            accept="image/*"
            multiple
            style="display: none"
          />
          <button @click="$refs.fileInput.click()" class="upload-btn">
            <i class="fas fa-cloud-upload-alt"></i> 选择图片文件
          </button>
        </div>

        <div class="image-list" v-if="images.length > 0">
          <h4>已选择的图片 ({{ images.length }} 张):</h4>
          <div class="image-item" v-for="(image, index) in images" :key="index">
            <div class="image-preview">
              <img :src="image.preview" :alt="image.name" />
            </div>
            <div class="image-info">
              <span class="image-name">{{ image.name }}</span>
              <span class="image-size">({{ formatFileSize(image.size) }})</span>
            </div>
            <div class="image-actions">
              <button @click="moveUp(index)" :disabled="index === 0" class="move-btn">
                <i class="fas fa-arrow-up"></i>
              </button>
              <button @click="moveDown(index)" :disabled="index === images.length - 1" class="move-btn">
                <i class="fas fa-arrow-down"></i>
              </button>
              <button @click="removeImage(index)" class="remove-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="options-row" v-if="images.length > 0">
          <div class="option-group">
            <label>页面方向:</label>
            <select v-model="orientation">
              <option value="portrait">竖向</option>
              <option value="landscape">横向</option>
            </select>
          </div>
          <div class="option-group">
            <label>图片适配:</label>
            <select v-model="fitMode">
              <option value="fit">适应页面</option>
              <option value="fill">填充页面</option>
              <option value="original">原始尺寸</option>
            </select>
          </div>
        </div>
      </div>

      <div class="action-section">
        <button @click="generatePdf" class="generate-btn" :disabled="images.length === 0 || isGenerating">
          <i :class="isGenerating ? 'fas fa-spinner fa-spin' : 'fas fa-file-pdf'"></i>
          {{ isGenerating ? '生成中...' : '生成 PDF' }}
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
          <li>支持JPG、PNG、GIF等常见图片格式</li>
          <li>可以选择多张图片，按顺序生成PDF</li>
          <li>通过箭头按钮调整图片顺序</li>
          <li>处理过程在浏览器本地完成，保护隐私</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ImageToPdf',
  setup() {
    const images = ref([])
    const orientation = ref('portrait')
    const fitMode = ref('fit')
    const error = ref('')
    const success = ref('')
    const isGenerating = ref(false)

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            images.value.push({
              name: file.name,
              size: file.size,
              preview: e.target.result,
              file: file
            })
          }
          reader.readAsDataURL(file)
        }
      })
      event.target.value = ''
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
        const imageArray = [...images.value]
        const temp = imageArray[index]
        imageArray[index] = imageArray[index - 1]
        imageArray[index - 1] = temp
        images.value = imageArray
      }
    }

    const moveDown = (index) => {
      if (index < images.value.length - 1) {
        const imageArray = [...images.value]
        const temp = imageArray[index]
        imageArray[index] = imageArray[index + 1]
        imageArray[index + 1] = temp
        images.value = imageArray
      }
    }

    const removeImage = (index) => {
      images.value.splice(index, 1)
    }

    const generatePdf = () => {
      error.value = ''
      success.value = ''
      isGenerating.value = true

      try {
        // 使用浏览器打印功能生成PDF
        const printWindow = window.open('', '_blank')
        const imageHtml = images.value.map(image => 
          `<div style="page-break-after: always; text-align: center; height: 100vh; display: flex; align-items: center; justify-content: center;">
            <img src="${image.preview}" style="max-width: 100%; max-height: 100%; object-fit: ${fitMode.value === 'fit' ? 'contain' : fitMode.value === 'fill' ? 'cover' : 'none'};" />
          </div>`
        ).join('')

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Images to PDF</title>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                font-family: Arial, sans-serif; 
              }
              @media print {
                body { margin: 0; }
                @page { 
                  margin: 0; 
                  size: ${orientation.value === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
                }
              }
            </style>
          </head>
          <body>
            ${imageHtml}
          </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)

        success.value = 'PDF生成成功！请在打印对话框中选择"保存为PDF"'
        setTimeout(() => success.value = '', 5000)

      } catch (err) {
        error.value = 'PDF生成失败: ' + err.message
      } finally {
        isGenerating.value = false
      }
    }

    const clearAll = () => {
      images.value = []
      error.value = ''
      success.value = ''
    }

    return {
      images,
      orientation,
      fitMode,
      error,
      success,
      isGenerating,
      handleFileUpload,
      formatFileSize,
      moveUp,
      moveDown,
      removeImage,
      generatePdf,
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

.image-list {
  margin-top: 20px;
}

.image-list h4 {
  margin-bottom: 15px;
  color: var(--text-primary);
}

.image-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--bg-primary);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--border-color);
}

.image-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.image-name {
  font-weight: 500;
  color: var(--text-primary);
}

.image-size {
  color: var(--text-secondary);
  font-size: 14px;
}

.image-actions {
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

.options-row {
  display: flex;
  gap: 30px;
  margin-top: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-group label {
  font-weight: 500;
}

.option-group select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.action-section {
  text-align: center;
  margin: 20px 0;
}

.generate-btn, .clear-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 10px;
  transition: all 0.3s;
}

.generate-btn {
  background: var(--success-color);
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background: var(--success-hover);
}

.generate-btn:disabled {
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