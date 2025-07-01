<template>
  <div class="triangle-solver">
    <div class="solver-container">
      <!-- 三角形可视化 -->
      <div class="triangle-visualization">
        <h3><i class="fas fa-shapes"></i> 三角形可视化</h3>
        <div class="triangle-canvas">
          <svg viewBox="0 0 400 300" class="triangle-svg">
            <!-- 三角形 -->
            <polygon 
              :points="trianglePoints" 
              fill="rgba(102, 126, 234, 0.2)" 
              stroke="#667eea" 
              stroke-width="2"/>
            
            <!-- 顶点 -->
            <circle cx="200" cy="50" r="4" fill="#667eea"/>
            <circle cx="100" cy="220" r="4" fill="#667eea"/>
            <circle cx="300" cy="220" r="4" fill="#667eea"/>
            
            <!-- 边长标签 -->
            <text x="150" y="140" class="edge-label" text-anchor="middle">
              边c {{ triangle.c ? `= ${triangle.c.toFixed(2)}` : '' }}
            </text>
            <text x="250" y="140" class="edge-label" text-anchor="middle">
              边b {{ triangle.b ? `= ${triangle.b.toFixed(2)}` : '' }}
            </text>
            <text x="200" y="250" class="edge-label" text-anchor="middle">
              边a {{ triangle.a ? `= ${triangle.a.toFixed(2)}` : '' }}
            </text>
            
            <!-- 角度标签 -->
            <text x="200" y="40" class="angle-label" text-anchor="middle">
              角A {{ triangle.A ? `= ${triangle.A.toFixed(1)}°` : '' }}
            </text>
            <text x="85" y="210" class="angle-label" text-anchor="middle">
              角B {{ triangle.B ? `= ${triangle.B.toFixed(1)}°` : '' }}
            </text>
            <text x="315" y="210" class="angle-label" text-anchor="middle">
              角C {{ triangle.C ? `= ${triangle.C.toFixed(1)}°` : '' }}
            </text>
          </svg>
        </div>
      </div>

      <!-- 输入面板 -->
      <div class="input-panel">
        <h3><i class="fas fa-edit"></i> 已知条件输入</h3>
        
        <!-- 边长输入 -->
        <div class="input-section">
          <h4>边长</h4>
          <div class="input-row">
            <div class="input-group">
              <label>边 a (BC对边)</label>
              <input 
                v-model="inputs.a" 
                type="number" 
                step="0.01" 
                placeholder="输入边长a"
                @input="calculate">
            </div>
            <div class="input-group">
              <label>边 b (AC对边)</label>
              <input 
                v-model="inputs.b" 
                type="number" 
                step="0.01" 
                placeholder="输入边长b"
                @input="calculate">
            </div>
            <div class="input-group">
              <label>边 c (AB对边)</label>
              <input 
                v-model="inputs.c" 
                type="number" 
                step="0.01" 
                placeholder="输入边长c"
                @input="calculate">
            </div>
          </div>
        </div>

        <!-- 角度输入 -->
        <div class="input-section">
          <h4>角度 (单位：度)</h4>
          <div class="input-row">
            <div class="input-group">
              <label>角 A (边a对角)</label>
              <input 
                v-model="inputs.A" 
                type="number" 
                step="0.1" 
                min="0" 
                max="180"
                placeholder="输入角度A"
                @input="calculate">
              <span class="input-suffix">°</span>
            </div>
            <div class="input-group">
              <label>角 B (边b对角)</label>
              <input 
                v-model="inputs.B" 
                type="number" 
                step="0.1" 
                min="0" 
                max="180"
                placeholder="输入角度B"
                @input="calculate">
              <span class="input-suffix">°</span>
            </div>
            <div class="input-group">
              <label>角 C (边c对角)</label>
              <input 
                v-model="inputs.C" 
                type="number" 
                step="0.1" 
                min="0" 
                max="180"
                placeholder="输入角度C"
                @input="calculate">
              <span class="input-suffix">°</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button @click="clearAll" class="btn-secondary">
            <i class="fas fa-eraser"></i> 清空所有
          </button>
          <button @click="loadExample" class="btn-primary">
            <i class="fas fa-lightbulb"></i> 加载示例
          </button>
        </div>
      </div>

      <!-- 计算结果 -->
      <div v-if="result.valid" class="result-panel">
        <h3><i class="fas fa-calculator"></i> 计算结果</h3>
        
        <div class="result-grid">
          <!-- 边长结果 -->
          <div class="result-section">
            <h4>边长</h4>
            <div class="result-items">
              <div class="result-item">
                <span class="label">边 a:</span>
                <span class="value">{{ triangle.a?.toFixed(2) || '未知' }}</span>
              </div>
              <div class="result-item">
                <span class="label">边 b:</span>
                <span class="value">{{ triangle.b?.toFixed(2) || '未知' }}</span>
              </div>
              <div class="result-item">
                <span class="label">边 c:</span>
                <span class="value">{{ triangle.c?.toFixed(2) || '未知' }}</span>
              </div>
            </div>
          </div>

          <!-- 角度结果 -->
          <div class="result-section">
            <h4>角度</h4>
            <div class="result-items">
              <div class="result-item">
                <span class="label">角 A:</span>
                <span class="value">{{ triangle.A?.toFixed(1) || '未知' }}°</span>
              </div>
              <div class="result-item">
                <span class="label">角 B:</span>
                <span class="value">{{ triangle.B?.toFixed(1) || '未知' }}°</span>
              </div>
              <div class="result-item">
                <span class="label">角 C:</span>
                <span class="value">{{ triangle.C?.toFixed(1) || '未知' }}°</span>
              </div>
            </div>
          </div>

          <!-- 其他属性 -->
          <div class="result-section">
            <h4>其他属性</h4>
            <div class="result-items">
              <div class="result-item">
                <span class="label">周长:</span>
                <span class="value">{{ result.perimeter?.toFixed(2) || '未知' }}</span>
              </div>
              <div class="result-item">
                <span class="label">面积:</span>
                <span class="value">{{ result.area?.toFixed(2) || '未知' }}</span>
              </div>
              <div class="result-item">
                <span class="label">类型:</span>
                <span class="value">{{ result.type || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 解题过程 -->
        <div v-if="result.steps.length > 0" class="solution-steps">
          <h4><i class="fas fa-list-ol"></i> 解题过程</h4>
          <div class="steps-container">
            <div v-for="(step, index) in result.steps" :key="index" class="step-item">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <div class="step-formula">{{ step.formula }}</div>
                <div class="step-description">{{ step.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-panel">
        <h3><i class="fas fa-exclamation-triangle"></i> 错误提示</h3>
        <p>{{ error }}</p>
      </div>

      <!-- 三角形知识 -->
      <div class="knowledge-section">
        <h3><i class="fas fa-book"></i> 三角形基础知识</h3>
        <div class="knowledge-grid">
          <div class="knowledge-card">
            <i class="fas fa-ruler"></i>
            <div>
              <strong>正弦定理</strong>
              <p>a/sin(A) = b/sin(B) = c/sin(C) = 2R</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-square-root-alt"></i>
            <div>
              <strong>余弦定理</strong>
              <p>c² = a² + b² - 2ab·cos(C)</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-plus"></i>
            <div>
              <strong>角度和</strong>
              <p>A + B + C = 180°</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-chart-area"></i>
            <div>
              <strong>海伦公式</strong>
              <p>S = √[s(s-a)(s-b)(s-c)]，其中s = (a+b+c)/2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'TriangleSolver',
  setup() {
    const inputs = ref({
      a: '',
      b: '',
      c: '',
      A: '',
      B: '',
      C: ''
    })
    
    const triangle = ref({
      a: null,
      b: null,
      c: null,
      A: null,
      B: null,
      C: null
    })
    
    const error = ref('')
    
    const result = ref({
      valid: false,
      perimeter: null,
      area: null,
      type: null,
      steps: []
    })
    
    const trianglePoints = computed(() => {
      return "200,50 100,220 300,220"
    })
    
    const toRadians = (degrees) => degrees * Math.PI / 180
    const toDegrees = (radians) => radians * 180 / Math.PI
    
    const calculate = () => {
      error.value = ''
      result.value.steps = []
      
      // 解析输入
      const a = parseFloat(inputs.value.a) || null
      const b = parseFloat(inputs.value.b) || null
      const c = parseFloat(inputs.value.c) || null
      const A = parseFloat(inputs.value.A) || null
      const B = parseFloat(inputs.value.B) || null
      const C = parseFloat(inputs.value.C) || null
      
      // 计算已知条件数量
      const knownSides = [a, b, c].filter(x => x !== null).length
      const knownAngles = [A, B, C].filter(x => x !== null).length
      
      if (knownSides + knownAngles < 3) {
        result.value.valid = false
        return
      }
      
      try {
        // 重置三角形数据
        triangle.value = { a, b, c, A, B, C }
        
        // 根据已知条件选择解法
        if (knownSides === 3) {
          solveSSSTriangle()
        } else if (knownSides === 2 && knownAngles === 1) {
          solveSASorSSATriangle()
        } else if (knownSides === 1 && knownAngles === 2) {
          solveASAorAASTriangle()
        } else if (knownAngles === 3) {
          error.value = '仅知道三个角度无法确定三角形的大小'
          result.value.valid = false
          return
        }
        
        // 验证三角形有效性
        if (!validateTriangle()) {
          result.value.valid = false
          return
        }
        
        // 计算额外属性
        calculateProperties()
        result.value.valid = true
        
      } catch (e) {
        error.value = e.message
        result.value.valid = false
      }
    }
    
    const solveSSSTriangle = () => {
      const { a, b, c } = triangle.value
      result.value.steps.push({
        formula: '已知三边，使用余弦定理求角度',
        description: 'SSS情况：已知三边长度'
      })
      
      // 使用余弦定理求角度
      triangle.value.A = toDegrees(Math.acos((b*b + c*c - a*a) / (2*b*c)))
      triangle.value.B = toDegrees(Math.acos((a*a + c*c - b*b) / (2*a*c)))
      triangle.value.C = 180 - triangle.value.A - triangle.value.B
      
      result.value.steps.push({
        formula: `cos(A) = (b²+c²-a²)/(2bc) = (${b}²+${c}²-${a}²)/(2×${b}×${c})`,
        description: `角A = ${triangle.value.A.toFixed(1)}°`
      })
    }
    
    const solveSASorSSATriangle = () => {
      const { a, b, c, A, B, C } = triangle.value
      
      if (a && b && C) {
        // SAS情况：两边夹一角
        result.value.steps.push({
          formula: '已知两边夹一角，使用余弦定理',
          description: 'SAS情况：两边及夹角'
        })
        
        triangle.value.c = Math.sqrt(a*a + b*b - 2*a*b*Math.cos(toRadians(C)))
        triangle.value.A = toDegrees(Math.asin(a * Math.sin(toRadians(C)) / triangle.value.c))
        triangle.value.B = 180 - triangle.value.A - C
        
        result.value.steps.push({
          formula: `c² = a²+b²-2ab×cos(C) = ${a}²+${b}²-2×${a}×${b}×cos(${C}°)`,
          description: `边c = ${triangle.value.c.toFixed(2)}`
        })
      } else {
        // SSA情况：两边夹一角的对边
        solveSASVariants()
      }
    }
    
    const solveSASVariants = () => {
      // 处理其他SAS/SSA情况
      const { a, b, c, A, B, C } = triangle.value
      
      if (a && b && A) {
        // 已知两边和其中一边的对角
        const sinB = b * Math.sin(toRadians(A)) / a
        if (sinB > 1) {
          throw new Error('无解：给定条件无法构成三角形')
        }
        triangle.value.B = toDegrees(Math.asin(sinB))
        triangle.value.C = 180 - A - triangle.value.B
        triangle.value.c = a * Math.sin(toRadians(triangle.value.C)) / Math.sin(toRadians(A))
      }
      // 类似处理其他情况...
    }
    
    const solveASAorAASTriangle = () => {
      // ASA或AAS情况：已知两角一边
      const { a, b, c, A, B, C } = triangle.value
      
      result.value.steps.push({
        formula: '已知两角一边，使用正弦定理',
        description: 'ASA/AAS情况：两角及一边'
      })
      
      // 计算第三个角
      if (!A) triangle.value.A = 180 - B - C
      if (!B) triangle.value.B = 180 - A - C
      if (!C) triangle.value.C = 180 - A - B
      
      // 使用正弦定理计算其他边
      if (a && !b && !c) {
        triangle.value.b = a * Math.sin(toRadians(triangle.value.B)) / Math.sin(toRadians(triangle.value.A))
        triangle.value.c = a * Math.sin(toRadians(triangle.value.C)) / Math.sin(toRadians(triangle.value.A))
      }
      // 类似处理其他情况...
    }
    
    const validateTriangle = () => {
      const { a, b, c, A, B, C } = triangle.value
      
      // 检查边长是否为正数
      if ((a && a <= 0) || (b && b <= 0) || (c && c <= 0)) {
        error.value = '边长必须为正数'
        return false
      }
      
      // 检查角度范围
      if ((A && (A <= 0 || A >= 180)) || (B && (B <= 0 || B >= 180)) || (C && (C <= 0 || C >= 180))) {
        error.value = '角度必须在0°到180°之间'
        return false
      }
      
      // 检查三角形不等式
      if (a && b && c) {
        if (a + b <= c || a + c <= b || b + c <= a) {
          error.value = '不满足三角形不等式：任意两边之和必须大于第三边'
          return false
        }
      }
      
      // 检查角度和
      if (A && B && C) {
        const angleSum = A + B + C
        if (Math.abs(angleSum - 180) > 0.1) {
          error.value = `三角形内角和必须为180°，当前为${angleSum.toFixed(1)}°`
          return false
        }
      }
      
      return true
    }
    
    const calculateProperties = () => {
      const { a, b, c } = triangle.value
      
      if (a && b && c) {
        // 周长
        result.value.perimeter = a + b + c
        
        // 面积（海伦公式）
        const s = result.value.perimeter / 2
        result.value.area = Math.sqrt(s * (s - a) * (s - b) * (s - c))
        
        // 判断三角形类型
        const sides = [a, b, c].sort((x, y) => x - y)
        const [side1, side2, hypotenuse] = sides
        
        if (Math.abs(side1*side1 + side2*side2 - hypotenuse*hypotenuse) < 0.01) {
          result.value.type = '直角三角形'
        } else if (side1*side1 + side2*side2 < hypotenuse*hypotenuse) {
          result.value.type = '钝角三角形'
        } else {
          result.value.type = '锐角三角形'
        }
        
        // 检查是否为等腰或等边
        if (Math.abs(a - b) < 0.01 && Math.abs(b - c) < 0.01) {
          result.value.type = '等边三角形'
        } else if (Math.abs(a - b) < 0.01 || Math.abs(b - c) < 0.01 || Math.abs(a - c) < 0.01) {
          result.value.type += ' (等腰)'
        }
      }
    }
    
    const clearAll = () => {
      Object.keys(inputs.value).forEach(key => {
        inputs.value[key] = ''
      })
      triangle.value = { a: null, b: null, c: null, A: null, B: null, C: null }
      result.value.valid = false
      error.value = ''
    }
    
    const loadExample = () => {
      inputs.value.a = '3'
      inputs.value.b = '4'
      inputs.value.c = '5'
      calculate()
    }
    
    return {
      inputs,
      triangle,
      result,
      error,
      trianglePoints,
      calculate,
      clearAll,
      loadExample
    }
  }
}
</script>

<style scoped>
.triangle-solver {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.solver-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.triangle-visualization {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.triangle-visualization h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.triangle-canvas {
  display: flex;
  justify-content: center;
}

.triangle-svg {
  width: 100%;
  max-width: 400px;
  height: 300px;
}

.edge-label, .angle-label {
  fill: #667eea;
  font-size: 12px;
  font-weight: 500;
}

.input-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.input-panel h3 {
  margin: 0 0 1.5rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-section {
  margin-bottom: 2rem;
}

.input-section h4 {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
}

.input-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.input-group {
  position: relative;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-suffix {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  margin-top: 0.25rem;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.result-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.result-panel h3 {
  margin: 0 0 1.5rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.result-section h4 {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
}

.result-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.result-item .label {
  color: rgba(255, 255, 255, 0.8);
}

.result-item .value {
  color: #667eea;
  font-weight: 500;
}

.solution-steps {
  margin-top: 2rem;
}

.solution-steps h4 {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  min-width: 2rem;
  height: 2rem;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.step-content {
  flex: 1;
}

.step-formula {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.step-description {
  color: rgba(255, 255, 255, 0.8);
}

.error-panel {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  color: #f44336;
}

.error-panel h3 {
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.knowledge-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.knowledge-section h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.knowledge-card {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.knowledge-card i {
  color: #667eea;
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.knowledge-card strong {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  display: block;
}

.knowledge-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-family: monospace;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .input-row {
    grid-template-columns: 1fr;
  }
  
  .result-grid {
    grid-template-columns: 1fr;
  }
  
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 