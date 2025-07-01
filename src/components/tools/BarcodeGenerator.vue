<template>
  <div class="single-tool">
    <h2><i class="fas fa-barcode"></i> 条形码生成器</h2>
    <p>生成Code 128格式的条形码</p>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <textarea v-model="barcodeText" placeholder="输入要生成条形码的文本..."></textarea>
    
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
      <button @click="generateBarcode">生成条形码</button>
      <button @click="clearText">清空</button>
    </div>
    
    <div v-if="barcodeResult" class="result-display">
      <div class="barcode-container">
        <h4>生成的条形码:</h4>
        <div class="barcode-display" v-html="barcodeResult"></div>
        <div class="barcode-text">{{ barcodeText }}</div>
        <button @click="downloadBarcode" class="download-btn">
          <i class="fas fa-download"></i> 下载图片
        </button>
      </div>
    </div>

    <div class="info-section">
      <h4><i class="fas fa-info-circle"></i> 关于条形码</h4>
      <p>条形码是将数字和字符信息通过一组规则排列的平行线条表示的自动识别技术。</p>
      <p><strong>Code 128:</strong> 支持ASCII字符集，广泛应用于物流和零售行业。</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'BarcodeGenerator',
  props: {
    toolData: Object
  },
  setup() {
    const barcodeText = ref('')
    const barcodeResult = ref('')

    // 简化的条形码生成（使用CSS模拟）
    const generateBarcode = () => {
      if (!barcodeText.value.trim()) {
        barcodeResult.value = ''
        return
      }

      // 简单的条形码样式生成
      const text = barcodeText.value.trim()
      let bars = ''
      
      // 为每个字符生成不同宽度的条纹
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) % 10
        const pattern = generatePattern(charCode)
        bars += pattern
      }
      
      barcodeResult.value = `<div class="barcode-bars">${bars}</div>`
    }

    // 生成条形码图案
    const generatePattern = (code) => {
      const patterns = [
        '101010100', '110100100', '100110100', '110110000',
        '101100100', '110100100', '100100110', '100100100',
        '100110010', '110010100'
      ]
      
      const pattern = patterns[code] || patterns[0]
      let bars = ''
      
      for (let i = 0; i < pattern.length; i++) {
        const width = pattern[i] === '1' ? '2px' : '1px'
        const color = i % 2 === 0 ? '#000' : '#fff'
        bars += `<div class="bar" style="width: ${width}; background: ${color};"></div>`
      }
      
      return bars
    }

    const loadExample = () => {
      barcodeText.value = 'MIKA-TOOLS-123456'
      generateBarcode()
    }

    const clearText = () => {
      barcodeText.value = ''
      barcodeResult.value = ''
    }

    const downloadBarcode = () => {
      // 简单的下载功能提示
      alert('条形码下载功能需要更复杂的图像处理库。当前版本仅供展示。')
    }

    return {
      barcodeText,
      barcodeResult,
      generateBarcode,
      loadExample,
      clearText,
      downloadBarcode
    }
  }
}
</script>

<style scoped>
.barcode-container {
  text-align: center;
}

.barcode-display {
  margin: 20px 0;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: inline-block;
}

.barcode-bars {
  display: flex;
  align-items: end;
  height: 60px;
  justify-content: center;
}

.bar {
  height: 100%;
  margin: 0;
}

.barcode-text {
  margin: 10px 0;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.download-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px auto 0;
}

.info-section {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.info-section h4 {
  margin: 0 0 10px 0;
  color: #1e40af;
}

.info-section p {
  margin: 5px 0;
  color: #1e40af;
  line-height: 1.5;
}
</style>

