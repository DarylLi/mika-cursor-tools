<template>
  <div class="tool-card">
    <!-- 渐变色头部 -->
    <div class="tool-header" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
      <div class="tool-icon">
        <i class="fas fa-id-card"></i>
      </div>
      <div class="tool-title">
        <h2>统一社会信用代码生成器</h2>
        <p>生成符合国标的18位统一社会信用代码</p>
      </div>
    </div>

    <!-- 示例按钮 -->
    <div class="example-section">
      <button @click="generateRandom" class="example-btn">
        <i class="fas fa-random"></i> 随机生成
      </button>
      <button @click="loadExample" class="example-btn">
        <i class="fas fa-magic"></i> 加载示例
      </button>
    </div>

    <!-- 配置选项 -->
    <div class="form-section">
      <h3><i class="fas fa-cog"></i> 代码构成</h3>
      
      <!-- 登记管理部门代码 -->
      <div class="form-group">
        <label>登记管理部门代码 (第1位)</label>
        <select v-model="registrationAuthority">
          <option value="1">1 - 机构编制</option>
          <option value="5">5 - 民政</option>
          <option value="9">9 - 工商</option>
          <option value="Y">Y - 其他</option>
        </select>
      </div>

      <!-- 机构类别代码 -->
      <div class="form-group">
        <label>机构类别代码 (第2位)</label>
        <select v-model="organizationType">
          <option value="1">1 - 机关</option>
          <option value="2">2 - 事业单位</option>
          <option value="3">3 - 社会团体</option>
          <option value="4">4 - 企业</option>
          <option value="5">5 - 个体工商户</option>
          <option value="9">9 - 其他</option>
        </select>
      </div>

      <!-- 登记管理机关行政区划码 -->
      <div class="form-group">
        <label>行政区划码 (第3-8位)</label>
        <select v-model="areaCode" @change="updateAreaCode">
          <option value="">选择省市</option>
          <option v-for="area in areaList" :key="area.code" :value="area.code">
            {{ area.code }} - {{ area.name }}
          </option>
        </select>
        <input v-model="customAreaCode" type="text" placeholder="或手动输入6位区划码" maxlength="6">
      </div>

      <!-- 主体标识码 -->
      <div class="form-group">
        <label>主体标识码 (第9-17位)</label>
        <div class="identifier-options">
          <label>
            <input type="radio" v-model="identifierMethod" value="auto">
            自动生成
          </label>
          <label>
            <input type="radio" v-model="identifierMethod" value="manual">
            手动输入
          </label>
        </div>
        <input 
          v-if="identifierMethod === 'manual'" 
          v-model="customIdentifier" 
          type="text" 
          placeholder="输入9位主体标识码" 
          maxlength="9"
        >
      </div>

      <!-- 批量生成 -->
      <div class="form-group">
        <label>批量生成数量</label>
        <input v-model.number="batchCount" type="number" min="1" max="1000" placeholder="1">
      </div>
    </div>

    <!-- 生成结果 -->
    <div v-if="generatedCodes.length > 0" class="result-display">
      <h3><i class="fas fa-list"></i> 生成结果</h3>
      <div v-if="generatedCodes.length === 1" class="single-result">
        <div class="code-display">{{ generatedCodes[0] }}</div>
        <div class="code-breakdown">
          <div class="breakdown-item">
            <span class="breakdown-label">登记部门:</span>
            <span class="breakdown-value">{{ getAuthorityName(generatedCodes[0][0]) }}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">机构类别:</span>
            <span class="breakdown-value">{{ getTypeName(generatedCodes[0][1]) }}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">行政区划:</span>
            <span class="breakdown-value">{{ generatedCodes[0].substring(2, 8) }}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">主体标识:</span>
            <span class="breakdown-value">{{ generatedCodes[0].substring(8, 17) }}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">校验码:</span>
            <span class="breakdown-value">{{ generatedCodes[0][17] }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="batch-results">
        <div class="batch-list">
          <div v-for="(code, index) in generatedCodes" :key="index" class="batch-item">
            <span class="batch-number">{{ index + 1 }}.</span>
            <span class="batch-code">{{ code }}</span>
            <button @click="copyToClipboard(code)" class="mini-copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div class="result-actions">
        <button @click="copyAllCodes" class="copy-btn">
          <i class="fas fa-copy"></i> 复制全部
        </button>
        <button @click="downloadCodes" class="download-btn">
          <i class="fas fa-download"></i> 下载文件
        </button>
        <button @click="validateCodes" class="validate-btn">
          <i class="fas fa-check"></i> 验证代码
        </button>
      </div>
    </div>

    <!-- 代码验证 -->
    <div class="validation-section">
      <h3><i class="fas fa-search"></i> 代码验证</h3>
      <div class="form-group">
        <label>输入统一社会信用代码</label>
        <input v-model="validateCode" type="text" placeholder="输入18位统一社会信用代码" maxlength="18">
        <button @click="validateSingleCode" class="validate-btn">
          <i class="fas fa-check"></i> 验证
        </button>
      </div>
      
      <div v-if="validationResult" class="validation-result">
        <div :class="['validation-status', validationResult.valid ? 'valid' : 'invalid']">
          <i :class="validationResult.valid ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          {{ validationResult.valid ? '代码有效' : '代码无效' }}
        </div>
        <div v-if="validationResult.valid" class="validation-details">
          <div class="detail-item">
            <span class="detail-label">登记部门:</span>
            <span class="detail-value">{{ validationResult.authority }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">机构类别:</span>
            <span class="detail-value">{{ validationResult.type }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">行政区划:</span>
            <span class="detail-value">{{ validationResult.area }}</span>
          </div>
        </div>
        <div v-if="!validationResult.valid" class="validation-errors">
          <ul>
            <li v-for="error in validationResult.errors" :key="error">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="help-section">
      <h3><i class="fas fa-question-circle"></i> 使用说明</h3>
      <ul>
        <li><strong>代码结构：</strong>18位统一社会信用代码由登记管理部门代码(1位) + 机构类别代码(1位) + 登记管理机关行政区划码(6位) + 主体标识码(9位) + 校验码(1位)组成</li>
        <li><strong>校验算法：</strong>使用GB 32100-2015国家标准规定的算法自动计算校验码</li>
        <li><strong>随机生成：</strong>可自动生成符合规范的测试用代码</li>
        <li><strong>批量生成：</strong>支持一次生成多个代码，用于测试等场景</li>
        <li><strong>代码验证：</strong>可验证现有代码的有效性和格式</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'CreditCodeGenerator',
  setup() {
    // 响应式数据
    const registrationAuthority = ref('9')
    const organizationType = ref('4')
    const areaCode = ref('')
    const customAreaCode = ref('')
    const identifierMethod = ref('auto')
    const customIdentifier = ref('')
    const batchCount = ref(1)
    const generatedCodes = ref([])
    const validateCode = ref('')
    const validationResult = ref(null)

    // 行政区划代码列表 (简化版)
    const areaList = [
      { code: '110000', name: '北京市' },
      { code: '120000', name: '天津市' },
      { code: '130000', name: '河北省' },
      { code: '140000', name: '山西省' },
      { code: '150000', name: '内蒙古自治区' },
      { code: '210000', name: '辽宁省' },
      { code: '220000', name: '吉林省' },
      { code: '230000', name: '黑龙江省' },
      { code: '310000', name: '上海市' },
      { code: '320000', name: '江苏省' },
      { code: '330000', name: '浙江省' },
      { code: '340000', name: '安徽省' },
      { code: '350000', name: '福建省' },
      { code: '360000', name: '江西省' },
      { code: '370000', name: '山东省' },
      { code: '410000', name: '河南省' },
      { code: '420000', name: '湖北省' },
      { code: '430000', name: '湖南省' },
      { code: '440000', name: '广东省' },
      { code: '450000', name: '广西壮族自治区' },
      { code: '460000', name: '海南省' },
      { code: '500000', name: '重庆市' },
      { code: '510000', name: '四川省' },
      { code: '520000', name: '贵州省' },
      { code: '530000', name: '云南省' },
      { code: '540000', name: '西藏自治区' },
      { code: '610000', name: '陕西省' },
      { code: '620000', name: '甘肃省' },
      { code: '630000', name: '青海省' },
      { code: '640000', name: '宁夏回族自治区' },
      { code: '650000', name: '新疆维吾尔自治区' }
    ]

    // 字符映射表
    const charMap = '0123456789ABCDEFGHJKLMNPQRTUWXY'

    // 加权因子
    const weights = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]

    // 计算校验码
    const calculateCheckCode = (code17) => {
      let sum = 0
      for (let i = 0; i < 17; i++) {
        const char = code17[i]
        const value = charMap.indexOf(char)
        sum += value * weights[i]
      }
      const remainder = sum % 31
      return charMap[31 - remainder]
    }

    // 生成随机字符
    const randomChar = () => {
      return charMap[Math.floor(Math.random() * charMap.length)]
    }

    // 生成随机数字
    const randomDigit = () => {
      return Math.floor(Math.random() * 10).toString()
    }

    // 生成主体标识码
    const generateIdentifier = () => {
      if (identifierMethod.value === 'manual' && customIdentifier.value) {
        return customIdentifier.value.padEnd(9, '0').substring(0, 9)
      }
      
      let identifier = ''
      for (let i = 0; i < 9; i++) {
        identifier += randomChar()
      }
      return identifier
    }

    // 获取行政区划码
    const getAreaCode = () => {
      if (customAreaCode.value) {
        return customAreaCode.value.padEnd(6, '0').substring(0, 6)
      }
      if (areaCode.value) {
        return areaCode.value
      }
      // 默认使用北京
      return '110000'
    }

    // 生成单个代码
    const generateSingleCode = () => {
      const authority = registrationAuthority.value
      const type = organizationType.value
      const area = getAreaCode()
      const identifier = generateIdentifier()
      
      const code17 = authority + type + area + identifier
      const checkCode = calculateCheckCode(code17)
      
      return code17 + checkCode
    }

    // 随机生成
    const generateRandom = () => {
      // 随机选择部门和类型
      const authorities = ['1', '5', '9', 'Y']
      const types = ['1', '2', '3', '4', '5', '9']
      
      registrationAuthority.value = authorities[Math.floor(Math.random() * authorities.length)]
      organizationType.value = types[Math.floor(Math.random() * types.length)]
      
      // 随机选择区域
      const randomArea = areaList[Math.floor(Math.random() * areaList.length)]
      areaCode.value = randomArea.code
      
      // 自动生成标识码
      identifierMethod.value = 'auto'
      
      // 生成代码
      generateCodes()
    }

    // 生成代码
    const generateCodes = () => {
      const count = Math.min(Math.max(1, batchCount.value || 1), 1000)
      const codes = []
      
      for (let i = 0; i < count; i++) {
        codes.push(generateSingleCode())
      }
      
      generatedCodes.value = codes
    }

    // 更新区域代码
    const updateAreaCode = () => {
      customAreaCode.value = ''
    }

    // 加载示例
    const loadExample = () => {
      registrationAuthority.value = '9'
      organizationType.value = '4'
      areaCode.value = '110000'
      identifierMethod.value = 'auto'
      batchCount.value = 5
      generateCodes()
    }

    // 获取部门名称
    const getAuthorityName = (code) => {
      const map = {
        '1': '机构编制',
        '5': '民政',
        '9': '工商',
        'Y': '其他'
      }
      return map[code] || '未知'
    }

    // 获取类型名称
    const getTypeName = (code) => {
      const map = {
        '1': '机关',
        '2': '事业单位',
        '3': '社会团体',
        '4': '企业',
        '5': '个体工商户',
        '9': '其他'
      }
      return map[code] || '未知'
    }

    // 验证单个代码
    const validateSingleCode = () => {
      const code = validateCode.value.trim().toUpperCase()
      validationResult.value = validateCreditCode(code)
    }

    // 验证统一社会信用代码
    const validateCreditCode = (code) => {
      const errors = []
      
      if (!code) {
        errors.push('代码不能为空')
        return { valid: false, errors }
      }
      
      if (code.length !== 18) {
        errors.push('代码长度必须为18位')
        return { valid: false, errors }
      }
      
      // 检查字符有效性
      for (let i = 0; i < 18; i++) {
        if (charMap.indexOf(code[i]) === -1) {
          errors.push(`第${i + 1}位字符"${code[i]}"无效`)
        }
      }
      
      if (errors.length > 0) {
        return { valid: false, errors }
      }
      
      // 验证校验码
      const code17 = code.substring(0, 17)
      const actualCheckCode = code[17]
      const expectedCheckCode = calculateCheckCode(code17)
      
      if (actualCheckCode !== expectedCheckCode) {
        errors.push(`校验码错误，应为"${expectedCheckCode}"`)
        return { valid: false, errors }
      }
      
      return {
        valid: true,
        authority: getAuthorityName(code[0]),
        type: getTypeName(code[1]),
        area: code.substring(2, 8)
      }
    }

    // 验证生成的代码
    const validateCodes = () => {
      const validCount = generatedCodes.value.filter(code => 
        validateCreditCode(code).valid
      ).length
      
      alert(`验证完成：\n有效代码: ${validCount}\n总数: ${generatedCodes.value.length}`)
    }

    // 复制到剪贴板
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        alert('已复制到剪贴板！')
      } catch (err) {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('已复制到剪贴板！')
      }
    }

    // 复制全部代码
    const copyAllCodes = () => {
      const text = generatedCodes.value.join('\n')
      copyToClipboard(text)
    }

    // 下载代码文件
    const downloadCodes = () => {
      if (generatedCodes.value.length === 0) return
      
      const content = generatedCodes.value.join('\n')
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `credit_codes_${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    // 监听变化
    watch([registrationAuthority, organizationType, areaCode, customAreaCode, identifierMethod, customIdentifier], () => {
      if (generatedCodes.value.length > 0) {
        generateCodes()
      }
    })

    return {
      registrationAuthority,
      organizationType,
      areaCode,
      customAreaCode,
      identifierMethod,
      customIdentifier,
      batchCount,
      generatedCodes,
      validateCode,
      validationResult,
      areaList,
      generateRandom,
      generateCodes,
      updateAreaCode,
      loadExample,
      getAuthorityName,
      getTypeName,
      validateSingleCode,
      validateCodes,
      copyToClipboard,
      copyAllCodes,
      downloadCodes
    }
  }
}
</script>

<style scoped>
.form-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.identifier-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.identifier-options label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.code-display {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.code-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.breakdown-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.breakdown-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.3rem;
}

.breakdown-value {
  display: block;
  font-weight: 600;
  color: #495057;
  font-size: 1.1rem;
}

.batch-results {
  max-height: 400px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.batch-list {
  display: grid;
  gap: 0.5rem;
}

.batch-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 0.8rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.batch-number {
  font-weight: 600;
  color: #6c757d;
  min-width: 30px;
}

.batch-code {
  font-family: 'Courier New', monospace;
  flex: 1;
  font-weight: 500;
}

.mini-copy-btn {
  background: linear-gradient(45deg, #6c757d, #495057);
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

.result-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.copy-btn, .download-btn, .validate-btn {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.validate-btn {
  background: linear-gradient(45deg, #007bff, #6610f2);
}

.copy-btn:hover, .download-btn:hover, .validate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
}

.validation-section {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.validation-section .form-group {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.validation-section .form-group input {
  flex: 1;
}

.validation-result {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.validation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.validation-status.valid {
  color: #28a745;
}

.validation-status.invalid {
  color: #dc3545;
}

.validation-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.detail-item {
  text-align: center;
}

.detail-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.2rem;
}

.detail-value {
  display: block;
  font-weight: 600;
  color: #495057;
}

.validation-errors ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.validation-errors li {
  color: #dc3545;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.validation-errors li::before {
  content: '×';
  position: absolute;
  left: 0;
  font-weight: bold;
}

.help-section {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
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
  color: #4caf50;
  font-weight: bold;
  position: absolute;
  left: 0;
}

@media (max-width: 768px) {
  .code-breakdown {
    grid-template-columns: 1fr;
  }
  
  .validation-section .form-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .validation-details {
    grid-template-columns: 1fr;
  }
}
</style> 