<template>
  <div class="single-tool">
    <h2><i class="fas fa-palette"></i> 颜色转换</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <input v-model="colorInput" placeholder="输入颜色值 (如: #ff0000, rgb(255,0,0))">
    <button @click="convertColor">转换颜色</button>
    
    <div class="result-display">
      {{ result }}
      <div v-if="colorPreview" 
           :style="{ backgroundColor: colorPreview, width: '100px', height: '50px', marginTop: '10px', borderRadius: '5px' }">
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ColorConverter',
  props: {
    toolData: Object
  },
  setup() {
    const colorInput = ref('')
    const result = ref('')
    const colorPreview = ref('')

    const loadExample = () => {
      colorInput.value = '#3498db'
      
      setTimeout(() => {
        convertColor()
      }, 500)
    }

    const convertColor = () => {
      const color = colorInput.value.trim()
      
      if (!color) {
        result.value = '请输入颜色值'
        return
      }
      
      let resultText = ''
      colorPreview.value = ''
      
      // HEX转RGB
      if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
        const hex = color.substring(1)
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        
        const hsl = rgbToHsl(r, g, b)
        
        resultText = `HEX: ${color.toUpperCase()}
RGB: rgb(${r}, ${g}, ${b})
HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
        colorPreview.value = color
      }
      // RGB转其他格式
      else if (color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)) {
        const match = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
        const r = parseInt(match[1])
        const g = parseInt(match[2])
        const b = parseInt(match[3])
        
        const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
        const hsl = rgbToHsl(r, g, b)
        
        resultText = `RGB: rgb(${r}, ${g}, ${b})
HEX: ${hex.toUpperCase()}
HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
        colorPreview.value = color
      }
      else {
        resultText = '不支持的颜色格式\n支持格式: #RRGGBB, rgb(r,g,b)'
      }
      
      result.value = resultText
    }

    // RGB转HSL工具函数
    const rgbToHsl = (r, g, b) => {
      r /= 255
      g /= 255
      b /= 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h, s, l = (max + min) / 2
      
      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }
      
      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      }
    }

    return {
      colorInput,
      result,
      colorPreview,
      loadExample,
      convertColor
    }
  }
}
</script> 