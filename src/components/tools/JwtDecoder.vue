<template>
  <div class="single-tool">
    <h2><i class="fas fa-key"></i> JWT Decoder</h2>
    <p>解析 JWT Token，查看头部、载荷和签名信息</p>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 加载示例
      </button>
    </div>
    
    <textarea v-model="jwtToken" @input="decodeJWT" placeholder="粘贴你的 JWT token 到这里..." rows="4"></textarea>
    
    <div v-if="decodedJWT" class="result-display">
      <div class="jwt-parts">
        <div class="jwt-part">
          <h4>Header (头部)</h4>
          <pre class="json-output">{{ formatJSON(decodedJWT.header) }}</pre>
        </div>
        
        <div class="jwt-part">
          <h4>Payload (载荷)</h4>
          <pre class="json-output">{{ formatJSON(decodedJWT.payload) }}</pre>
        </div>
        
        <div class="jwt-part">
          <h4>Signature (签名)</h4>
          <div class="signature-info">
            <p>签名需要密钥验证，这里仅显示Base64编码结果</p>
            <code>{{ decodedJWT.signature }}</code>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'JwtDecoder',
  props: {
    toolData: Object
  },
  setup() {
    const jwtToken = ref('')
    const decodedJWT = ref(null)
    const error = ref('')

    // Base64URL解码函数
    const base64URLDecode = (str) => {
      try {
        str = str.replace(/-/g, '+').replace(/_/g, '/')
        while (str.length % 4) {
          str += '='
        }
        return atob(str)
      } catch (e) {
        throw new Error('Base64URL解码失败')
      }
    }

    // 解码JWT
    const decodeJWT = () => {
      error.value = ''
      decodedJWT.value = null
      
      if (!jwtToken.value.trim()) return
      
      try {
        const parts = jwtToken.value.split('.')
        
        if (parts.length !== 3) {
          throw new Error('JWT格式错误：应包含3个由点分隔的部分')
        }
        
        const header = JSON.parse(base64URLDecode(parts[0]))
        const payload = JSON.parse(base64URLDecode(parts[1]))
        const signature = parts[2]
        
        decodedJWT.value = {
          header,
          payload,
          signature
        }
      } catch (e) {
        error.value = e.message || 'JWT解析失败'
      }
    }

    // 格式化JSON输出
    const formatJSON = (obj) => {
      return JSON.stringify(obj, null, 2)
    }

    // 加载示例
    const loadExample = () => {
      jwtToken.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      decodeJWT()
    }

    return {
      jwtToken,
      decodedJWT,
      error,
      decodeJWT,
      formatJSON,
      loadExample
    }
  }
}
</script>

<style scoped>
.jwt-parts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.jwt-part {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.jwt-part h4 {
  margin: 0;
  padding: 15px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1rem;
}

.json-output {
  padding: 15px;
  margin: 0;
  background: #fafafa;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
}

.signature-info {
  padding: 15px;
}

.signature-info p {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.signature-info code {
  background: #f3f4f6;
  padding: 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  display: block;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style> 