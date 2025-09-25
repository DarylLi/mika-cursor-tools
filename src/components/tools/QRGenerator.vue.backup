<template>
  <div class="qr-generator-tool">
    <div class="tool-header">
      <h2><i class="fas fa-qrcode"></i> 二维码生成器</h2>
      <p>快速生成各种内容的二维码</p>
    </div>

    <div class="tool-content">
      <div class="section">
        <h3><i class="fas fa-edit"></i> 输入内容</h3>
        
        <div class="input-group">
          <label for="qrText">要生成二维码的内容：</label>
          <textarea 
            id="qrText"
            v-model="qrText" 
            placeholder="输入文本、URL、邮箱、电话号码等..."
            class="text-input"
            rows="4"
          ></textarea>
        </div>

        <div class="options-group">
          <div class="option-item">
            <label for="qrSize">尺寸：</label>
            <select id="qrSize" v-model="qrSize" class="size-select">
              <option value="200">小 (200x200)</option>
              <option value="300">中 (300x300)</option>
              <option value="400">大 (400x400)</option>
            </select>
          </div>
          
          <div class="option-item">
            <label for="errorLevel">容错级别：</label>
            <select id="errorLevel" v-model="errorLevel" class="error-select">
              <option value="L">低 (L)</option>
              <option value="M">中 (M)</option>
              <option value="Q">高 (Q)</option>
              <option value="H">最高 (H)</option>
            </select>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="generateQR" class="generate-btn" :disabled="!qrText.trim()">
            <i class="fas fa-magic"></i> 生成二维码
          </button>
          <button @click="loadExample" class="example-btn">
            <i class="fas fa-lightbulb"></i> 加载示例
          </button>
        </div>
      </div>

      <div class="section" v-if="qrDataUrl">
        <h3><i class="fas fa-image"></i> 生成结果</h3>
        
        <div class="qr-result">
          <div class="qr-display">
            <img :src="qrDataUrl" :alt="qrText" class="qr-image" />
          </div>
          
          <div class="download-section">
            <button @click="downloadQR" class="download-btn">
              <i class="fas fa-download"></i> 下载二维码
            </button>
          </div>
        </div>
      </div>

      <div class="section">
        <h3><i class="fas fa-info-circle"></i> 使用说明</h3>
        <div class="info-content">
          <div class="info-card">
            <h4>支持内容类型</h4>
            <ul>
              <li>网址链接 (http://...)</li>
              <li>邮箱地址 (mailto:...)</li>
              <li>电话号码 (tel:...)</li>
              <li>WiFi信息</li>
              <li>纯文本内容</li>
            </ul>
          </div>
          <div class="info-card">
            <h4>容错级别说明</h4>
            <ul>
              <li>L: 约可纠正 7% 的数据码字</li>
              <li>M: 约可纠正 15% 的数据码字</li>
              <li>Q: 约可纠正 25% 的数据码字</li>
              <li>H: 约可纠正 30% 的数据码字</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import QRCode from 'qrcode'

export default {
  name: 'QRGenerator',
  props: {
    toolData: Object
  },
  setup() {
    const qrText = ref('')
    const qrSize = ref(300)
    const errorLevel = ref('M')
    const qrDataUrl = ref('')

    const loadExample = () => {
      qrText.value = `🛠️ 通用工具瑞士军刀
https://tools.example.com
一站式实用工具集合，包含50+个常用工具
📧 contact@example.com`
      
      setTimeout(() => {
        generateQR()
      }, 500)
    }

    const generateQR = async () => {
      const text = qrText.value.trim()
      
      if (!text) {
        alert('请输入要生成二维码的内容！')
        return
      }
      
      try {
        const dataUrl = await QRCode.toDataURL(text, {
          width: qrSize.value,
          height: qrSize.value,
          margin: 2,
          errorCorrectionLevel: errorLevel.value,
          type: 'image/png',
          quality: 0.92,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        qrDataUrl.value = dataUrl
      } catch (error) {
        console.error('二维码生成失败:', error)
        alert('二维码生成失败: ' + error.message)
      }
    }

    const downloadQR = () => {
      if (!qrDataUrl.value) return
      
      const link = document.createElement('a')
      link.download = `qrcode_${Date.now()}.png`
      link.href = qrDataUrl.value
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return {
      qrText,
      qrSize,
      errorLevel,
      qrDataUrl,
      loadExample,
      generateQR,
      downloadQR
    }
  }
}
</script>

<style scoped>
.qr-generator-tool {
  max-width: 800px;
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

.tool-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
}

.section h3 {
  color: var(--primary-color);
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.text-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.options-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.option-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.size-select,
.error-select {
  width: 100%;
  padding: 10px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}

.size-select:focus,
.error-select:focus {
  border-color: var(--primary-color);
  outline: none;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.generate-btn,
.example-btn,
.download-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.generate-btn {
  background: var(--primary-color);
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.generate-btn:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
  transform: none;
}

.example-btn {
  background: var(--accent-color);
  color: white;
}

.example-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.download-btn {
  background: var(--success-color, #28a745);
  color: white;
}

.download-btn:hover {
  background: var(--success-hover, #218838);
  transform: translateY(-2px);
}

.qr-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qr-display {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--border-color);
}

.qr-image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.download-section {
  text-align: center;
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.info-card {
  background: var(--bg-primary);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.info-card h4 {
  color: var(--primary-color);
  margin-bottom: 12px;
  font-size: 1rem;
}

.info-card ul {
  margin: 0;
  padding-left: 20px;
}

.info-card li {
  margin-bottom: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .qr-generator-tool {
    padding: 15px;
  }
  
  .section {
    padding: 16px;
  }
  
  .options-group {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons button {
    width: 100%;
    justify-content: center;
  }
  
  .qr-result {
    text-align: center;
  }
  
  .info-content {
    grid-template-columns: 1fr;
  }
}
</style> 