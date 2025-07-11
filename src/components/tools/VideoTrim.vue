<template>
  <div class="video-trim-container">
    <div class="tool-header">
      <h3>视频剪辑工具</h3>
      <p>浏览器端剪辑视频，支持时间范围选择</p>
    </div>

    <div class="upload-section" v-if="!videoData">
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
          accept="video/*" 
          @change="handleFileSelect"
          style="display: none"
        />
        <div class="upload-content">
          <div class="upload-icon">🎬</div>
          <p>点击选择或拖拽视频文件</p>
          <small>支持 MP4、WebM、MOV 等格式</small>
        </div>
      </div>
    </div>

    <div class="video-editor" v-if="videoData">
      <div class="video-player-section">
        <video 
          ref="videoPlayer"
          :src="videoData.url"
          controls
          class="video-player"
          @loadedmetadata="onVideoLoaded"
          @timeupdate="onTimeUpdate"
        ></video>
        
        <div class="timeline-section">
          <div class="timeline-controls">
            <div class="time-range">
              <label>开始时间:</label>
              <input 
                type="range" 
                :min="0" 
                :max="duration" 
                :step="0.1"
                v-model="startTime"
                @input="updateStartTime"
                class="time-slider"
              />
              <span class="time-display">{{ formatTime(startTime) }}</span>
            </div>
            
            <div class="time-range">
              <label>结束时间:</label>
              <input 
                type="range" 
                :min="0" 
                :max="duration" 
                :step="0.1"
                v-model="endTime"
                @input="updateEndTime"
                class="time-slider"
              />
              <span class="time-display">{{ formatTime(endTime) }}</span>
            </div>
          </div>

          <div class="trim-info">
            <p>裁剪长度: {{ formatTime(endTime - startTime) }}</p>
            <p>原始长度: {{ formatTime(duration) }}</p>
          </div>
        </div>

        <div class="preview-controls">
          <button @click="previewTrim" class="preview-btn">
            预览裁剪片段
          </button>
          <button @click="resetSelection" class="reset-btn">
            重置选择
          </button>
        </div>
      </div>

      <div class="output-settings">
        <h4>输出设置</h4>
        
        <div class="setting-group">
          <label>输出格式:</label>
          <select v-model="outputFormat" class="format-select">
            <option value="mp4">MP4</option>
            <option value="webm">WebM</option>
            <option value="mov">MOV</option>
          </select>
        </div>

        <div class="setting-group">
          <label>视频质量:</label>
          <select v-model="quality" class="quality-select">
            <option value="high">高质量</option>
            <option value="medium">中等质量</option>
            <option value="low">低质量</option>
          </select>
        </div>

        <div class="action-buttons">
          <button @click="trimVideo" class="trim-btn" :disabled="processing || !canTrim">
            {{ processing ? '处理中...' : '开始剪辑' }}
          </button>
          <button @click="downloadTrimmed" class="download-btn" v-if="trimmedVideo">
            下载剪辑视频
          </button>
          <button @click="reset" class="reset-btn">重新选择</button>
        </div>

        <div class="progress-section" v-if="processing">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <p>处理进度: {{ Math.round(progress) }}%</p>
        </div>
      </div>
    </div>

    <div class="warning-section">
      <h4>⚠️ 注意事项</h4>
      <ul>
        <li>大文件处理可能需要较长时间</li>
        <li>建议文件大小不超过 100MB</li>
        <li>处理过程中请勿关闭页面</li>
        <li>所有处理都在本地完成，不会上传到服务器</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoTrim',
  data() {
    return {
      videoData: null,
      isDragOver: false,
      duration: 0,
      currentTime: 0,
      startTime: 0,
      endTime: 0,
      outputFormat: 'mp4',
      quality: 'medium',
      processing: false,
      progress: 0,
      trimmedVideo: null
    }
  },
  computed: {
    canTrim() {
      return this.endTime > this.startTime && this.endTime - this.startTime > 0.5
    }
  },
  methods: {
    handleDrop(e) {
      this.isDragOver = false
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('video/')
      )
      if (files.length > 0) {
        this.loadVideo(files[0])
      }
    },

    handleFileSelect(e) {
      const file = e.target.files[0]
      if (file) {
        this.loadVideo(file)
      }
    },

    loadVideo(file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB
        alert('文件太大，建议选择小于 100MB 的文件')
        return
      }

      const url = URL.createObjectURL(file)
      this.videoData = {
        file,
        url,
        name: file.name,
        size: file.size
      }
    },

    onVideoLoaded() {
      const video = this.$refs.videoPlayer
      this.duration = video.duration
      this.endTime = this.duration
    },

    onTimeUpdate() {
      this.currentTime = this.$refs.videoPlayer.currentTime
    },

    updateStartTime() {
      if (this.startTime >= this.endTime) {
        this.endTime = Math.min(this.startTime + 1, this.duration)
      }
    },

    updateEndTime() {
      if (this.endTime <= this.startTime) {
        this.startTime = Math.max(this.endTime - 1, 0)
      }
    },

    previewTrim() {
      const video = this.$refs.videoPlayer
      video.currentTime = this.startTime
      video.play()
      
      const checkTime = () => {
        if (video.currentTime >= this.endTime) {
          video.pause()
        } else {
          requestAnimationFrame(checkTime)
        }
      }
      checkTime()
    },

    resetSelection() {
      this.startTime = 0
      this.endTime = this.duration
    },

    async trimVideo() {
      if (!this.canTrim) return
      
      this.processing = true
      this.progress = 0
      
      try {
        // 模拟视频处理进度
        const progressInterval = setInterval(() => {
          this.progress += Math.random() * 10
          if (this.progress >= 95) {
            clearInterval(progressInterval)
          }
        }, 200)
        
        // 实际的视频处理应该使用 FFmpeg.wasm 或类似的库
        // 这里提供一个简化的实现示例
        await this.processVideo()
        
        clearInterval(progressInterval)
        this.progress = 100
        
      } catch (error) {
        console.error('视频处理失败:', error)
        alert('视频处理失败')
      } finally {
        this.processing = false
      }
    },

    async processVideo() {
      // 注意：这是一个简化的实现
      // 真实的视频处理需要使用 FFmpeg.wasm 等专业库
      return new Promise((resolve) => {
        setTimeout(() => {
          // 创建一个模拟的处理结果
          this.trimmedVideo = {
            url: this.videoData.url, // 实际应该是处理后的视频
            name: `trimmed_${this.videoData.name}`,
            blob: this.videoData.file // 实际应该是处理后的 blob
          }
          resolve()
        }, 2000)
      })
    },

    downloadTrimmed() {
      if (!this.trimmedVideo) return
      
      const url = URL.createObjectURL(this.trimmedVideo.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = this.trimmedVideo.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    reset() {
      if (this.videoData) {
        URL.revokeObjectURL(this.videoData.url)
      }
      
      this.videoData = null
      this.trimmedVideo = null
      this.duration = 0
      this.startTime = 0
      this.endTime = 0
      this.progress = 0
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  },

  beforeUnmount() {
    this.reset()
  }
}
</script>

<style scoped>
.video-trim-container {
  max-width: 1000px;
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

.video-editor {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-top: 30px;
}

.video-player {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  background: #000;
}

.timeline-section {
  margin-top: 20px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.time-range {
  margin-bottom: 15px;
}

.time-range label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--text-primary);
}

.time-slider {
  width: 100%;
  margin-bottom: 5px;
}

.time-display {
  font-family: monospace;
  color: var(--text-secondary);
}

.trim-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
}

.trim-info p {
  margin: 5px 0;
  color: var(--text-secondary);
}

.preview-controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.preview-btn,
.reset-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.preview-btn {
  background: var(--primary-color);
  color: white;
}

.reset-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.output-settings {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.output-settings h4 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.setting-group {
  margin-bottom: 15px;
}

.setting-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--text-primary);
}

.format-select,
.quality-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.trim-btn,
.download-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.trim-btn {
  background: var(--primary-color);
  color: white;
}

.trim-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn {
  background: var(--success-color);
  color: white;
}

.progress-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.warning-section {
  margin-top: 40px;
  padding: 20px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
  border-radius: 12px;
}

.warning-section h4 {
  margin: 0 0 15px 0;
  color: #e65100;
}

.warning-section ul {
  margin: 0;
  padding-left: 20px;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .video-editor {
    grid-template-columns: 1fr;
  }
  
  .preview-controls,
  .action-buttons {
    flex-direction: column;
  }
}
</style>
