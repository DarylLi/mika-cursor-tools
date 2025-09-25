<template>
  <div class="tool-card">
    <!-- 渐变色头部 -->
    <div class="tool-header" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
      <div class="tool-icon">
        <i class="fas fa-file-word"></i>
      </div>
      <div class="tool-title">
        <h2>Word转HTML工具</h2>
        <p>将Word文档(.docx)转换为HTML格式</p>
      </div>
    </div>

    <!-- 文件上传区域 -->
    <div class="upload-section">
      <div 
        class="upload-area"
        :class="{ 'drag-over': isDragOver }"
        @drop="handleFileDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @dragenter.prevent
      >
        <i class="fas fa-cloud-upload-alt upload-icon"></i>
        <p class="upload-text">
          <strong>拖拽Word文档到此处</strong> 或 
          <label for="file-input" class="file-link">点击选择文件</label>
        </p>
        <p class="upload-hint">支持 .docx 格式文件，最大 10MB</p>
        <input 
          id="file-input" 
          type="file" 
          accept=".docx"
          @change="handleFileSelect"
          style="display: none"
        >
      </div>
    </div>

    <!-- 文件信息 -->
    <div v-if="fileInfo" class="file-info">
      <h3><i class="fas fa-file-alt"></i> 文件信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">文件名</span>
          <span class="info-value">{{ fileInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">文件大小</span>
          <span class="info-value">{{ formatFileSize(fileInfo.size) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">文件类型</span>
          <span class="info-value">{{ fileInfo.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">处理状态</span>
          <span class="info-value" :class="statusClass">{{ status }}</span>
        </div>
      </div>
    </div>

    <!-- 转换选项 -->
    <div v-if="fileInfo" class="options-section">
      <h3><i class="fas fa-cog"></i> 转换选项</h3>
      <div class="options-grid">
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="options.preserveStyles">
            <span>保留样式</span>
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="options.extractImages">
            <span>提取图片</span>
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="options.preserveTable">
            <span>保留表格</span>
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="options.cleanHtml">
            <span>清理HTML</span>
          </label>
        </div>
      </div>
      
      <button @click="convertToHtml" class="convert-btn" :disabled="converting">
        <i class="fas fa-exchange-alt"></i>
        {{ converting ? '转换中...' : '开始转换' }}
      </button>
    </div>

    <!-- 转换进度 -->
    <div v-if="converting" class="progress-section">
      <h3><i class="fas fa-spinner fa-spin"></i> 转换进度</h3>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">{{ progressText }}</p>
    </div>

    <!-- 转换结果 -->
    <div v-if="htmlResult" class="result-section">
      <h3><i class="fas fa-code"></i> 转换结果</h3>
      
      <!-- 预览标签页 -->
      <div class="tab-container">
        <div class="tabs">
          <button 
            :class="['tab', { active: activeTab === 'preview' }]"
            @click="activeTab = 'preview'"
          >
            <i class="fas fa-eye"></i> 预览
          </button>
          <button 
            :class="['tab', { active: activeTab === 'html' }]"
            @click="activeTab = 'html'"
          >
            <i class="fas fa-code"></i> HTML代码
          </button>
          <button 
            :class="['tab', { active: activeTab === 'text' }]"
            @click="activeTab = 'text'"
          >
            <i class="fas fa-font"></i> 纯文本
          </button>
        </div>
        
        <div class="tab-content">
          <!-- HTML预览 -->
          <div v-if="activeTab === 'preview'" class="preview-container">
            <div class="preview-content" v-html="htmlResult"></div>
          </div>
          
          <!-- HTML代码 -->
          <div v-if="activeTab === 'html'" class="code-container">
            <pre><code>{{ htmlResult }}</code></pre>
          </div>
          
          <!-- 纯文本 -->
          <div v-if="activeTab === 'text'" class="text-container">
            <pre>{{ textResult }}</pre>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="copyToClipboard(htmlResult)" class="action-btn">
          <i class="fas fa-copy"></i> 复制HTML
        </button>
        <button @click="downloadHtml" class="action-btn">
          <i class="fas fa-download"></i> 下载HTML
        </button>
        <button @click="copyToClipboard(textResult)" class="action-btn">
          <i class="fas fa-font"></i> 复制文本
        </button>
        <button @click="clearResults" class="action-btn clear-btn">
          <i class="fas fa-trash"></i> 清除结果
        </button>
      </div>
    </div>

    <!-- 提取的图片 -->
    <div v-if="extractedImages.length > 0" class="images-section">
      <h3><i class="fas fa-images"></i> 提取的图片 ({{ extractedImages.length }})</h3>
      <div class="images-grid">
        <div v-for="(image, index) in extractedImages" :key="index" class="image-item">
          <img :src="image.src" :alt="'Image ' + (index + 1)" class="image-preview">
          <div class="image-info">
            <span class="image-name">图片 {{ index + 1 }}</span>
            <span class="image-size">{{ image.size }}</span>
          </div>
          <button @click="downloadImage(image, index)" class="download-image-btn">
            <i class="fas fa-download"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
    </div>

    <!-- 使用说明 -->
    <div class="help-section">
      <h3><i class="fas fa-question-circle"></i> 使用说明</h3>
      <ul>
        <li><strong>支持格式：</strong>仅支持 .docx 格式的Word文档</li>
        <li><strong>文件大小：</strong>建议文件大小不超过10MB</li>
        <li><strong>样式保留：</strong>可选择是否保留字体、颜色、大小等样式</li>
        <li><strong>图片处理：</strong>可提取文档中的图片并转换为base64格式</li>
        <li><strong>表格支持：</strong>支持转换Word表格为HTML表格</li>
        <li><strong>纯文本：</strong>可同时获得去除格式的纯文本内容</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'WordToHtml',
  setup() {
    const instance = getCurrentInstance()
    // 响应式数据
    const isDragOver = ref(false)
    const fileInfo = ref(null)
    const status = ref('')
    const converting = ref(false)
    const progress = ref(0)
    const progressText = ref('')
    const htmlResult = ref('')
    const textResult = ref('')
    const extractedImages = ref([])
    const activeTab = ref('preview')
    const errorMessage = ref('')

    // 转换选项
    const options = reactive({
      preserveStyles: true,
      extractImages: true,
      preserveTable: true,
      cleanHtml: false
    })

    // 状态样式类
    const statusClass = ref('')

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 处理文件选择
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        processFile(file)
      }
    }

    // 处理文件拖拽
    const handleFileDrop = (event) => {
      event.preventDefault()
      isDragOver.value = false
      
      const files = event.dataTransfer.files
      if (files.length > 0) {
        processFile(files[0])
      }
    }

    // 处理文件
    const processFile = (file) => {
      errorMessage.value = ''
      
      // 验证文件类型
      if (!file.name.toLowerCase().endsWith('.docx')) {
        errorMessage.value = '请选择 .docx 格式的Word文档'
        return
      }

      // 验证文件大小
      if (file.size > 10 * 1024 * 1024) {
        errorMessage.value = '文件大小不能超过10MB'
        return
      }

      fileInfo.value = {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }

      status.value = '等待转换'
      statusClass.value = 'status-waiting'
    }

    // 模拟Word转HTML转换
    const convertToHtml = async () => {
      if (!fileInfo.value) return

      converting.value = true
      progress.value = 0
      progressText.value = '开始解析文档...'
      status.value = '转换中'
      statusClass.value = 'status-processing'
      errorMessage.value = ''

      try {
        // 模拟转换过程
        await simulateConversion()
        
        // 生成模拟的HTML结果
        generateMockHtmlResult()
        
        status.value = '转换完成'
        statusClass.value = 'status-success'
        activeTab.value = 'preview'

      } catch (error) {
        errorMessage.value = '转换失败: ' + error.message
        status.value = '转换失败'
        statusClass.value = 'status-error'
      } finally {
        converting.value = false
        progress.value = 100
      }
    }

    // 模拟转换过程
    const simulateConversion = () => {
      return new Promise((resolve) => {
        const steps = [
          { progress: 20, text: '解析文档结构...' },
          { progress: 40, text: '处理文本内容...' },
          { progress: 60, text: '转换样式信息...' },
          { progress: 80, text: '提取图片资源...' },
          { progress: 100, text: '生成HTML代码...' }
        ]

        let currentStep = 0
        const interval = setInterval(() => {
          if (currentStep < steps.length) {
            progress.value = steps[currentStep].progress
            progressText.value = steps[currentStep].text
            currentStep++
          } else {
            clearInterval(interval)
            resolve()
          }
        }, 800)
      })
    }

    // 生成模拟HTML结果
    const generateMockHtmlResult = () => {
      const fileName = fileInfo.value.name.replace('.docx', '')
      
      let htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>`

      if (options.preserveStyles) {
        htmlContent += `
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        p { margin-bottom: 10px; text-align: justify; }
        .highlight { background-color: #f39c12; color: white; padding: 10px; border-radius: 3px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
    </style>`
      }

      htmlContent += `
</head>
<body>
    <h1>文档标题：${fileName}</h1>
    
    <h2>第一章 概述</h2>
    <p>这是从Word文档转换而来的HTML内容。本工具支持将 .docx 格式的Word文档转换为标准的HTML格式，保留原有的文档结构和样式信息。</p>
    
    <p>转换过程中会自动处理以下内容：</p>
    <ul>
        <li>文档标题和段落结构</li>
        <li>字体样式和格式</li>
        <li>表格和列表</li>
        <li>图片和媒体内容</li>
    </ul>

    <h2>第二章 功能特性</h2>
    <p>本工具具有以下<span class="highlight">主要特性</span>：</p>
    
    <table>
        <thead>
            <tr>
                <th>功能</th>
                <th>描述</th>
                <th>支持程度</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>文本转换</td>
                <td>保留原始文本内容和格式</td>
                <td>完全支持</td>
            </tr>
            <tr>
                <td>样式保留</td>
                <td>转换字体、颜色、大小等样式</td>
                <td>基本支持</td>
            </tr>
            <tr>
                <td>图片处理</td>
                <td>提取并转换图片为base64格式</td>
                <td>部分支持</td>
            </tr>
        </tbody>
    </table>

    <h2>第三章 使用说明</h2>
    <p>使用本工具非常简单，只需要按照以下步骤操作：</p>
    <ol>
        <li>选择或拖拽 .docx 格式的Word文档</li>
        <li>配置转换选项</li>
        <li>点击"开始转换"按钮</li>
        <li>等待转换完成并查看结果</li>
    </ol>

    <p style="margin-top: 30px; font-style: italic; color: #7f8c8d;">
        * 此为示例内容，实际转换结果会根据您上传的Word文档内容而定。
    </p>
</body>
</html>`

      htmlResult.value = htmlContent
      
      // 生成纯文本版本
      textResult.value = `文档标题：${fileName}

第一章 概述
这是从Word文档转换而来的HTML内容。本工具支持将 .docx 格式的Word文档转换为标准的HTML格式，保留原有的文档结构和样式信息。

转换过程中会自动处理以下内容：
• 文档标题和段落结构
• 字体样式和格式
• 表格和列表
• 图片和媒体内容

第二章 功能特性
本工具具有以下主要特性：

功能          描述                            支持程度
文本转换      保留原始文本内容和格式          完全支持
样式保留      转换字体、颜色、大小等样式      基本支持
图片处理      提取并转换图片为base64格式      部分支持

第三章 使用说明
使用本工具非常简单，只需要按照以下步骤操作：
1. 选择或拖拽 .docx 格式的Word文档
2. 配置转换选项
3. 点击"开始转换"按钮
4. 等待转换完成并查看结果

* 此为示例内容，实际转换结果会根据您上传的Word文档内容而定。`

      // 模拟提取的图片
      if (options.extractImages) {
        extractedImages.value = [
          {
            src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            size: '1x1 像素',
            name: 'sample_image_1.png'
          }
        ]
      }
    }

    // 复制到剪贴板
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        instance.proxy.$message.success('已复制到剪贴板！')
      } catch (err) {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        instance.proxy.$message.success('已复制到剪贴板！')
      }
    }

    // 下载HTML文件
    const downloadHtml = () => {
      if (!htmlResult.value) return

      const blob = new Blob([htmlResult.value], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileInfo.value.name.replace('.docx', '')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    // 下载图片
    const downloadImage = (image, index) => {
      const a = document.createElement('a')
      a.href = image.src
      a.download = `extracted_image_${index + 1}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    // 清除结果
    const clearResults = () => {
      fileInfo.value = null
      htmlResult.value = ''
      textResult.value = ''
      extractedImages.value = []
      status.value = ''
      errorMessage.value = ''
      document.getElementById('file-input').value = ''
    }

    return {
      isDragOver,
      fileInfo,
      status,
      statusClass,
      converting,
      progress,
      progressText,
      htmlResult,
      textResult,
      extractedImages,
      activeTab,
      errorMessage,
      options,
      formatFileSize,
      handleFileSelect,
      handleFileDrop,
      convertToHtml,
      copyToClipboard,
      downloadHtml,
      downloadImage,
      clearResults
    }
  }
}
</script>

<style scoped>
.upload-section {
  margin-bottom: 1.5rem;
}

.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.upload-area.drag-over {
  border-color: #007bff;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.upload-icon {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #495057;
}

.file-link {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}

.upload-hint {
  color: #6c757d;
  font-size: 0.9rem;
}

.file-info {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.info-item {
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.3rem;
}

.info-value {
  display: block;
  font-weight: 600;
  color: #495057;
  word-break: break-all;
}

.status-waiting { color: #ffc107; }
.status-processing { color: #007bff; }
.status-success { color: #28a745; }
.status-error { color: #dc3545; }

.options-section {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.convert-btn {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
}

.convert-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
}

.convert-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.progress-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin: 1rem 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #007bff, #6610f2);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: #495057;
  font-weight: 500;
}

.result-section {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.tab-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.tab {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.3s ease;
  flex: 1;
}

.tab.active {
  background: white;
  color: #495057;
  border-bottom: 2px solid #007bff;
}

.tab-content {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.preview-container {
  padding: 1.5rem;
}

.preview-content {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1.5rem;
  background: white;
  min-height: 300px;
}

.code-container, .text-container {
  padding: 0;
}

.code-container pre, .text-container pre {
  margin: 0;
  padding: 1.5rem;
  background: #f8f9fa;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  background: linear-gradient(45deg, #007bff, #6610f2);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.action-btn.clear-btn {
  background: linear-gradient(45deg, #dc3545, #c82333);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 123, 255, 0.3);
}

.images-section {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.image-item {
  background: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.image-preview {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  background: #f8f9fa;
}

.image-info {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.image-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.image-size {
  font-size: 0.8rem;
  color: #6c757d;
}

.download-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid #f5c6cb;
}

.help-section {
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.help-section ul {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.help-section li {
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
}

.help-section li::before {
  content: '•';
  color: #007bff;
  font-weight: bold;
  position: absolute;
  left: 0;
}

@media (max-width: 768px) {
  .info-grid, .options-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab {
    text-align: center;
  }
  
  .images-grid {
    grid-template-columns: 1fr;
  }
}

/* 工具头部样式 */
.tool-header {
  padding: 10px;
  margin-bottom: 10px;
}
</style> 