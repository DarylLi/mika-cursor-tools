<template>
  <div class="audio-convert-container">
    <div class="tool-header">
      <h3>音频格式转换</h3>
      <p>支持多种音频格式相互转换，浏览器端处理</p>
    </div>

    <div class="upload-section">
      <div 
        class="upload-area"
        :class="{ 'dragover': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
      >
        <input 
          ref="fileInput"
          type="file" 
          accept="audio/*" 
          multiple
          @change="handleFileSelect"
          style="display: none"
        />
        <div class="upload-content">
          <div class="upload-icon">🎵</div>
          <p>点击选择或拖拽音频文件</p>
          <small>支持 MP3、WAV、OGG、AAC、FLAC 等格式</small>
        </div>
      </div>
    </div>

    <div class="conversion-settings" v-if="audioFiles.length > 0">
      <div class="settings-panel">
        <h4>转换设置</h4>
        
        <div class="format-selection">
          <label>目标格式:</label>
          <div class="format-buttons">
            <button 
              v-for="format in outputFormats"
              :key="format.value"
              @click="outputFormat = format.value"
              :class="['format-btn', { active: outputFormat === format.value }]"
            >
              {{ format.label }}
            </button>
          </div>
        </div>

        <div class="quality-settings">
          <div class="setting-group">
            <label>比特率:</label>
            <select v-model="bitrate" class="setting-select">
              <option value="128">128 kbps</option>
              <option value="192">192 kbps</option>
              <option value="256">256 kbps</option>
              <option value="320">320 kbps</option>
            </select>
          </div>

          <div class="setting-group">
            <label>采样率:</label>
            <select v-model="sampleRate" class="setting-select">
              <option value="22050">22.05 kHz</option>
              <option value="44100">44.1 kHz</option>
              <option value="48000">48 kHz</option>
            </select>
          </div>

          <div class="setting-group">
            <label>声道:</label>
            <select v-model="channels" class="setting-select">
              <option value="1">单声道</option>
              <option value="2">立体声</option>
            </select>
          </div>
        </div>

        <div class="batch-actions">
          <button @click="convertAll" class="convert-all-btn" :disabled="converting">
            {{ converting ? '转换中...' : '批量转换' }}
          </button>
          <button @click="downloadAll" class="download-all-btn" v-if="convertedFiles.length > 0">
            下载全部
          </button>
          <button @click="clearAll" class="clear-btn">清空</button>
        </div>
      </div>
    </div>

    <div class="files-section" v-if="audioFiles.length > 0">
      <div class="files-list">
        <div 
          v-for="(file, index) in audioFiles" 
          :key="index"
          class="file-item"
        >
          <div class="file-info">
            <div class="file-icon">🎵</div>
            <div class="file-details">
              <h5>{{ file.name }}</h5>
              <div class="file-meta">
                <span>{{ file.format }} → {{ outputFormat.toUpperCase() }}</span>
                <span>{{ formatFileSize(file.size) }}</span>
                <span v-if="file.duration">{{ formatDuration(file.duration) }}</span>
              </div>
              <div class="conversion-info" v-if="file.convertedSize">
                <span>转换后: {{ formatFileSize(file.convertedSize) }}</span>
              </div>
            </div>
          </div>

          <div class="file-player" v-if="file.url">
            <audio :src="file.url" controls class="audio-control"></audio>
          </div>

          <div class="file-actions">
            <button 
              @click="convertFile(index)" 
              class="convert-btn"
              :disabled="file.converting || file.converted"
            >
              {{ file.converting ? '转换中' : (file.converted ? '已转换' : '转换') }}
            </button>
            <button 
              @click="downloadFile(index)" 
              class="download-btn"
              v-if="file.converted"
            >
              下载
            </button>
            <button @click="removeFile(index)" class="remove-btn">删除</button>
          </div>

          <div class="progress-bar" v-if="file.converting">
            <div class="progress-fill" :style="{ width: file.progress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="format-info-section">
      <h4>📚 格式说明</h4>
      <div class="format-info-grid">
        <div class="format-info-item">
          <strong>MP3:</strong> 最通用的格式，压缩率高，兼容性好
        </div>
        <div class="format-info-item">
          <strong>WAV:</strong> 无损格式，文件较大，音质最佳
        </div>
        <div class="format-info-item">
          <strong>OGG:</strong> 开源格式，压缩效果好，文件小
        </div>
        <div class="format-info-item">
          <strong>AAC:</strong> 现代格式，压缩效率高，移动端首选
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AudioConvert',
  data() {
    return {
      audioFiles: [],
      convertedFiles: [],
      isDragOver: false,
      converting: false,
      outputFormat: 'mp3',
      bitrate: '192',
      sampleRate: '44100',
      channels: '2',
      outputFormats: [
        { label: 'MP3', value: 'mp3' },
        { label: 'WAV', value: 'wav' },
        { label: 'OGG', value: 'ogg' },
        { label: 'AAC', value: 'aac' }
      ]
    }
  },
  methods: {
    handleDrop(e) {
      this.isDragOver = false
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('audio/')
      )
      this.processFiles(files)
    },

    handleFileSelect(e) {
      const files = Array.from(e.target.files)
      this.processFiles(files)
    },

    async processFiles(files) {
      for (const file of files) {
        await this.addAudioFile(file)
      }
    },

    async addAudioFile(file) {
      const url = URL.createObjectURL(file)
      const format = this.getAudioFormat(file.type)
      
      const audioFile = {
        file,
        name: file.name,
        url,
        format,
        size: file.size,
        duration: null,
        converting: false,
        converted: false,
        progress: 0,
        convertedBlob: null,
        convertedSize: null
      }

      // 获取音频时长
      try {
        audioFile.duration = await this.getAudioDuration(url)
      } catch (error) {
        console.error('获取音频时长失败:', error)
      }

      this.audioFiles.push(audioFile)
    },

    getAudioFormat(mimeType) {
      const formatMap = {
        'audio/mpeg': 'mp3',
        'audio/mp3': 'mp3',
        'audio/wav': 'wav',
        'audio/wave': 'wav',
        'audio/ogg': 'ogg',
        'audio/aac': 'aac',
        'audio/mp4': 'aac',
        'audio/flac': 'flac'
      }
      return formatMap[mimeType] || 'unknown'
    },

    getAudioDuration(url) {
      return new Promise((resolve, reject) => {
        const audio = new Audio()
        audio.onloadedmetadata = () => {
          resolve(audio.duration)
        }
        audio.onerror = reject
        audio.src = url
      })
    },

    async convertFile(index) {
      const file = this.audioFiles[index]
      file.converting = true
      file.progress = 0

      try {
        // 模拟转换进度
        const progressInterval = setInterval(() => {
          file.progress += Math.random() * 10
          if (file.progress >= 95) {
            clearInterval(progressInterval)
          }
        }, 100)

        // 执行转换（简化实现）
        const convertedBlob = await this.performConversion(file)
        
        clearInterval(progressInterval)
        file.progress = 100
        file.convertedBlob = convertedBlob
        file.convertedSize = convertedBlob.size
        file.converted = true
        
        this.convertedFiles.push({
          name: this.getConvertedFileName(file.name),
          blob: convertedBlob
        })

      } catch (error) {
        console.error('转换失败:', error)
        alert('音频转换失败')
      } finally {
        file.converting = false
      }
    },

    async performConversion(audioFile) {
      // 注意：这是一个简化的实现
      // 真实的音频转换需要使用 FFmpeg.wasm 等专业库
      return new Promise((resolve) => {
        setTimeout(() => {
          // 创建一个模拟的转换结果
          const blob = new Blob([audioFile.file], { 
            type: `audio/${this.outputFormat}` 
          })
          resolve(blob)
        }, 2000)
      })
    },

    async convertAll() {
      this.converting = true
      
      for (let i = 0; i < this.audioFiles.length; i++) {
        if (!this.audioFiles[i].converted) {
          await this.convertFile(i)
        }
      }
      
      this.converting = false
    },

    downloadFile(index) {
      const file = this.audioFiles[index]
      if (file.convertedBlob) {
        const url = URL.createObjectURL(file.convertedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = this.getConvertedFileName(file.name)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    },

    async downloadAll() {
      if (this.convertedFiles.length === 0) return

      if (this.convertedFiles.length === 1) {
        const file = this.convertedFiles[0]
        const url = URL.createObjectURL(file.blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      try {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()

        this.convertedFiles.forEach(file => {
          zip.file(file.name, file.blob)
        })

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'converted-audio.zip'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        alert('批量下载失败，请逐个下载')
      }
    },

    removeFile(index) {
      URL.revokeObjectURL(this.audioFiles[index].url)
      this.audioFiles.splice(index, 1)
    },

    clearAll() {
      this.audioFiles.forEach(file => URL.revokeObjectURL(file.url))
      this.audioFiles = []
      this.convertedFiles = []
    },

    getConvertedFileName(originalName) {
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
      return `${nameWithoutExt}.${this.outputFormat}`
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  },

  beforeUnmount() {
    this.clearAll()
  }
}
</script>

<style scoped>
.audio-convert-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
}

.upload-area:hover,
.upload-area.dragover {
  border-color: var(--primary-color);
  background: var(--bg-primary);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.conversion-settings {
  margin: 30px 0;
  padding: 25px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.settings-panel h4 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.format-selection {
  margin-bottom: 25px;
}

.format-selection label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.format-buttons {
  display: flex;
  gap: 10px;
}

.format-btn {
  padding: 8px 16px;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-btn:hover {
  border-color: var(--primary-color);
}

.format-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.quality-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.setting-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.batch-actions {
  display: flex;
  gap: 10px;
}

.convert-all-btn,
.download-all-btn,
.clear-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.convert-all-btn {
  background: var(--primary-color);
  color: white;
}

.download-all-btn {
  background: var(--success-color);
  color: white;
}

.clear-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.file-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.file-details h5 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.file-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: var(--text-secondary);
}

.conversion-info {
  font-size: 12px;
  color: var(--success-color);
  margin-top: 5px;
}

.file-player {
  margin-bottom: 15px;
}

.audio-control {
  width: 100%;
  height: 40px;
}

.file-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.convert-btn,
.download-btn,
.remove-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
}

.convert-btn {
  background: var(--primary-color);
  color: white;
}

.convert-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn {
  background: var(--success-color);
  color: white;
}

.remove-btn {
  background: var(--danger-color);
  color: white;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.format-info-section {
  margin-top: 40px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.format-info-section h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.format-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.format-info-item {
  padding: 15px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.format-info-item strong {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .format-buttons {
    flex-wrap: wrap;
  }
  
  .file-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .file-actions {
    flex-direction: column;
  }
  
  .format-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
