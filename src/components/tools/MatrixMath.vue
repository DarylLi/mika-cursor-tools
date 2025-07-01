<template>
  <div class="matrix-math">
    <div class="math-container">
      <!-- 矩阵设置 -->
      <div class="matrix-setup">
        <h3><i class="fas fa-th"></i> 矩阵运算器</h3>
        
        <div class="operation-selector">
          <div class="operation-tabs">
            <button 
              v-for="op in operations" 
              :key="op.id"
              @click="selectedOperation = op.id"
              :class="{ active: selectedOperation === op.id }"
              class="operation-tab">
              <i :class="op.icon"></i>
              {{ op.name }}
            </button>
          </div>
        </div>

        <div class="matrix-size-controls">
          <div class="size-group">
            <label>矩阵A尺寸：</label>
            <select v-model="matrixA.rows" @change="resizeMatrix('A')">
              <option v-for="n in [1,2,3,4,5]" :key="n" :value="n">{{ n }}</option>
            </select>
            ×
            <select v-model="matrixA.cols" @change="resizeMatrix('A')">
              <option v-for="n in [1,2,3,4,5]" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          
          <div v-if="needsMatrixB" class="size-group">
            <label>矩阵B尺寸：</label>
            <select v-model="matrixB.rows" @change="resizeMatrix('B')">
              <option v-for="n in [1,2,3,4,5]" :key="n" :value="n">{{ n }}</option>
            </select>
            ×
            <select v-model="matrixB.cols" @change="resizeMatrix('B')">
              <option v-for="n in [1,2,3,4,5]" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 矩阵输入 -->
      <div class="matrices-input">
        <!-- 矩阵A -->
        <div class="matrix-section">
          <h4>矩阵 A ({{ matrixA.rows }}×{{ matrixA.cols }})</h4>
          <div class="matrix-input">
            <div class="matrix-bracket left">[</div>
            <div class="matrix-grid" :style="{ gridTemplateColumns: `repeat(${matrixA.cols}, 1fr)` }">
              <input 
                v-for="(value, index) in matrixA.data" 
                :key="`a-${index}`"
                v-model="matrixA.data[index]"
                type="number" 
                step="0.1"
                class="matrix-cell"
                @input="calculate">
            </div>
            <div class="matrix-bracket right">]</div>
          </div>
          <div class="matrix-tools">
            <button @click="fillRandom('A')" class="tool-btn">
              <i class="fas fa-dice"></i> 随机填充
            </button>
            <button @click="fillIdentity('A')" class="tool-btn" :disabled="matrixA.rows !== matrixA.cols">
              <i class="fas fa-eye"></i> 单位矩阵
            </button>
            <button @click="clearMatrix('A')" class="tool-btn">
              <i class="fas fa-eraser"></i> 清空
            </button>
          </div>
        </div>

        <!-- 矩阵B -->
        <div v-if="needsMatrixB" class="matrix-section">
          <h4>矩阵 B ({{ matrixB.rows }}×{{ matrixB.cols }})</h4>
          <div class="matrix-input">
            <div class="matrix-bracket left">[</div>
            <div class="matrix-grid" :style="{ gridTemplateColumns: `repeat(${matrixB.cols}, 1fr)` }">
              <input 
                v-for="(value, index) in matrixB.data" 
                :key="`b-${index}`"
                v-model="matrixB.data[index]"
                type="number" 
                step="0.1"
                class="matrix-cell"
                @input="calculate">
            </div>
            <div class="matrix-bracket right">]</div>
          </div>
          <div class="matrix-tools">
            <button @click="fillRandom('B')" class="tool-btn">
              <i class="fas fa-dice"></i> 随机填充
            </button>
            <button @click="fillIdentity('B')" class="tool-btn" :disabled="matrixB.rows !== matrixB.cols">
              <i class="fas fa-eye"></i> 单位矩阵
            </button>
            <button @click="clearMatrix('B')" class="tool-btn">
              <i class="fas fa-eraser"></i> 清空
            </button>
          </div>
        </div>

        <!-- 标量输入 -->
        <div v-if="needsScalar" class="scalar-section">
          <h4>标量</h4>
          <input v-model="scalar" type="number" step="0.1" class="scalar-input" @input="calculate">
        </div>
      </div>

      <!-- 计算结果 -->
      <div v-if="result.calculated" class="result-section">
        <h3><i class="fas fa-equals"></i> 计算结果</h3>
        
        <div class="result-display">
          <div class="result-header">
            <h4>{{ result.title }}</h4>
            <div class="result-info">
              尺寸：{{ result.rows }}×{{ result.cols }}
            </div>
          </div>
          
          <div class="result-matrix">
            <div class="matrix-bracket left">[</div>
            <div class="matrix-grid" :style="{ gridTemplateColumns: `repeat(${result.cols}, 1fr)` }">
              <span 
                v-for="(value, index) in result.data" 
                :key="`result-${index}`"
                class="result-cell">
                {{ formatNumber(value) }}
              </span>
            </div>
            <div class="matrix-bracket right">]</div>
          </div>

          <div class="result-properties" v-if="result.properties">
            <h5>矩阵属性</h5>
            <div class="properties-grid">
              <div v-if="result.properties.determinant !== undefined" class="property-item">
                <label>行列式：</label>
                <span>{{ formatNumber(result.properties.determinant) }}</span>
              </div>
              <div v-if="result.properties.trace !== undefined" class="property-item">
                <label>迹：</label>
                <span>{{ formatNumber(result.properties.trace) }}</span>
              </div>
              <div v-if="result.properties.rank !== undefined" class="property-item">
                <label>秩：</label>
                <span>{{ result.properties.rank }}</span>
              </div>
              <div v-if="result.properties.isSquare !== undefined" class="property-item">
                <label>方阵：</label>
                <span>{{ result.properties.isSquare ? '是' : '否' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <button @click="copyResult" class="action-btn">
            <i class="fas fa-copy"></i> 复制结果
          </button>
          <button @click="exportResult" class="action-btn">
            <i class="fas fa-download"></i> 导出
          </button>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-section">
        <h4><i class="fas fa-exclamation-triangle"></i> 错误</h4>
        <p>{{ error }}</p>
      </div>

      <!-- 快速示例 -->
      <div class="examples-section">
        <h3><i class="fas fa-lightbulb"></i> 矩阵示例</h3>
        <div class="examples-grid">
          <div v-for="example in examples" :key="example.name" class="example-card" @click="loadExample(example)">
            <div class="example-name">{{ example.name }}</div>
            <div class="example-desc">{{ example.description }}</div>
            <div class="example-size">{{ example.size }}</div>
          </div>
        </div>
      </div>

      <!-- 矩阵知识 -->
      <div class="knowledge-section">
        <h3><i class="fas fa-book"></i> 矩阵基础知识</h3>
        <div class="knowledge-grid">
          <div class="knowledge-card">
            <i class="fas fa-plus"></i>
            <div>
              <strong>矩阵加法</strong>
              <p>相同尺寸的矩阵对应元素相加</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-times"></i>
            <div>
              <strong>矩阵乘法</strong>
              <p>(m×n) × (n×p) = (m×p)，行乘列</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-exchange-alt"></i>
            <div>
              <strong>矩阵转置</strong>
              <p>行列互换，A^T[i,j] = A[j,i]</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-calculator"></i>
            <div>
              <strong>行列式</strong>
              <p>方阵的标量值，表示线性变换的伸缩因子</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-undo"></i>
            <div>
              <strong>逆矩阵</strong>
              <p>AA^(-1) = I，仅可逆方阵存在</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-eye"></i>
            <div>
              <strong>单位矩阵</strong>
              <p>主对角线为1，其余为0的方阵</p>
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
  name: 'MatrixMath',
  setup() {
    const selectedOperation = ref('add')
    const scalar = ref(1)
    const error = ref('')
    
    const matrixA = ref({
      rows: 2,
      cols: 2,
      data: ['1', '2', '3', '4']
    })
    
    const matrixB = ref({
      rows: 2,
      cols: 2,
      data: ['5', '6', '7', '8']
    })
    
    const result = ref({
      calculated: false,
      title: '',
      rows: 0,
      cols: 0,
      data: [],
      properties: null
    })
    
    const operations = [
      { id: 'add', name: '加法', icon: 'fas fa-plus' },
      { id: 'subtract', name: '减法', icon: 'fas fa-minus' },
      { id: 'multiply', name: '乘法', icon: 'fas fa-times' },
      { id: 'scalar', name: '数乘', icon: 'fas fa-expand-arrows-alt' },
      { id: 'transpose', name: '转置', icon: 'fas fa-exchange-alt' },
      { id: 'determinant', name: '行列式', icon: 'fas fa-calculator' },
      { id: 'inverse', name: '逆矩阵', icon: 'fas fa-undo' },
      { id: 'power', name: '幂运算', icon: 'fas fa-superscript' }
    ]
    
    const examples = [
      {
        name: '2×2基础',
        description: '基本2×2矩阵运算',
        size: '2×2',
        matrixA: { rows: 2, cols: 2, data: ['1', '2', '3', '4'] },
        matrixB: { rows: 2, cols: 2, data: ['5', '6', '7', '8'] }
      },
      {
        name: '3×3单位矩阵',
        description: '3阶单位矩阵',
        size: '3×3',
        matrixA: { rows: 3, cols: 3, data: ['1', '0', '0', '0', '1', '0', '0', '0', '1'] },
        matrixB: { rows: 3, cols: 3, data: ['2', '1', '0', '1', '2', '1', '0', '1', '2'] }
      },
      {
        name: '矩形矩阵',
        description: '非方阵运算',
        size: '2×3',
        matrixA: { rows: 2, cols: 3, data: ['1', '2', '3', '4', '5', '6'] },
        matrixB: { rows: 3, cols: 2, data: ['1', '2', '3', '4', '5', '6'] }
      }
    ]
    
    const needsMatrixB = computed(() => {
      return ['add', 'subtract', 'multiply'].includes(selectedOperation.value)
    })
    
    const needsScalar = computed(() => {
      return ['scalar', 'power'].includes(selectedOperation.value)
    })
    
    const resizeMatrix = (matrix) => {
      const target = matrix === 'A' ? matrixA.value : matrixB.value
      const newSize = target.rows * target.cols
      const currentData = target.data.slice()
      
      target.data = Array(newSize).fill('').map((_, index) => 
        currentData[index] || '0'
      )
      
      calculate()
    }
    
    const fillRandom = (matrix) => {
      const target = matrix === 'A' ? matrixA.value : matrixB.value
      target.data = target.data.map(() => 
        (Math.random() * 20 - 10).toFixed(1)
      )
      calculate()
    }
    
    const fillIdentity = (matrix) => {
      const target = matrix === 'A' ? matrixA.value : matrixB.value
      if (target.rows !== target.cols) return
      
      target.data = target.data.map((_, index) => {
        const row = Math.floor(index / target.cols)
        const col = index % target.cols
        return row === col ? '1' : '0'
      })
      calculate()
    }
    
    const clearMatrix = (matrix) => {
      const target = matrix === 'A' ? matrixA.value : matrixB.value
      target.data = target.data.map(() => '0')
      calculate()
    }
    
    const getMatrixArray = (matrix) => {
      return matrix.data.map(x => parseFloat(x) || 0)
    }
    
    const matrixAddition = () => {
      if (matrixA.value.rows !== matrixB.value.rows || matrixA.value.cols !== matrixB.value.cols) {
        throw new Error('矩阵加法要求两矩阵尺寸相同')
      }
      
      const dataA = getMatrixArray(matrixA.value)
      const dataB = getMatrixArray(matrixB.value)
      
      return {
        title: 'A + B',
        rows: matrixA.value.rows,
        cols: matrixA.value.cols,
        data: dataA.map((a, i) => a + dataB[i])
      }
    }
    
    const matrixSubtraction = () => {
      if (matrixA.value.rows !== matrixB.value.rows || matrixA.value.cols !== matrixB.value.cols) {
        throw new Error('矩阵减法要求两矩阵尺寸相同')
      }
      
      const dataA = getMatrixArray(matrixA.value)
      const dataB = getMatrixArray(matrixB.value)
      
      return {
        title: 'A - B',
        rows: matrixA.value.rows,
        cols: matrixA.value.cols,
        data: dataA.map((a, i) => a - dataB[i])
      }
    }
    
    const matrixMultiplication = () => {
      if (matrixA.value.cols !== matrixB.value.rows) {
        throw new Error('矩阵乘法要求A的列数等于B的行数')
      }
      
      const dataA = getMatrixArray(matrixA.value)
      const dataB = getMatrixArray(matrixB.value)
      const resultData = []
      
      for (let i = 0; i < matrixA.value.rows; i++) {
        for (let j = 0; j < matrixB.value.cols; j++) {
          let sum = 0
          for (let k = 0; k < matrixA.value.cols; k++) {
            sum += dataA[i * matrixA.value.cols + k] * dataB[k * matrixB.value.cols + j]
          }
          resultData.push(sum)
        }
      }
      
      return {
        title: 'A × B',
        rows: matrixA.value.rows,
        cols: matrixB.value.cols,
        data: resultData
      }
    }
    
    const scalarMultiplication = () => {
      const dataA = getMatrixArray(matrixA.value)
      const s = parseFloat(scalar.value) || 1
      
      return {
        title: `${s} × A`,
        rows: matrixA.value.rows,
        cols: matrixA.value.cols,
        data: dataA.map(x => x * s)
      }
    }
    
    const matrixTranspose = () => {
      const dataA = getMatrixArray(matrixA.value)
      const resultData = []
      
      for (let j = 0; j < matrixA.value.cols; j++) {
        for (let i = 0; i < matrixA.value.rows; i++) {
          resultData.push(dataA[i * matrixA.value.cols + j])
        }
      }
      
      return {
        title: 'A^T',
        rows: matrixA.value.cols,
        cols: matrixA.value.rows,
        data: resultData
      }
    }
    
    const calculateDeterminant = () => {
      if (matrixA.value.rows !== matrixA.value.cols) {
        throw new Error('只有方阵才能计算行列式')
      }
      
      const data = getMatrixArray(matrixA.value)
      const n = matrixA.value.rows
      let det = 0
      
      if (n === 1) {
        det = data[0]
      } else if (n === 2) {
        det = data[0] * data[3] - data[1] * data[2]
      } else if (n === 3) {
        det = data[0] * (data[4] * data[8] - data[5] * data[7]) -
              data[1] * (data[3] * data[8] - data[5] * data[6]) +
              data[2] * (data[3] * data[7] - data[4] * data[6])
      } else {
        // 简化实现，仅支持3阶以下
        throw new Error('当前仅支持3阶以下方阵的行列式计算')
      }
      
      return {
        title: 'det(A)',
        rows: 1,
        cols: 1,
        data: [det],
        properties: {
          determinant: det,
          isSquare: true
        }
      }
    }
    
    const calculateInverse = () => {
      if (matrixA.value.rows !== matrixA.value.cols) {
        throw new Error('只有方阵才能计算逆矩阵')
      }
      
      const data = getMatrixArray(matrixA.value)
      const n = matrixA.value.rows
      
      if (n === 2) {
        const det = data[0] * data[3] - data[1] * data[2]
        if (Math.abs(det) < 1e-10) {
          throw new Error('矩阵不可逆（行列式为0）')
        }
        
        const invData = [
          data[3] / det, -data[1] / det,
          -data[2] / det, data[0] / det
        ]
        
        return {
          title: 'A^(-1)',
          rows: 2,
          cols: 2,
          data: invData,
          properties: {
            determinant: det,
            isSquare: true
          }
        }
      } else {
        throw new Error('当前仅支持2×2矩阵的逆矩阵计算')
      }
    }
    
    const matrixPower = () => {
      if (matrixA.value.rows !== matrixA.value.cols) {
        throw new Error('只有方阵才能进行幂运算')
      }
      
      const power = parseInt(scalar.value) || 1
      if (power < 0) {
        throw new Error('当前不支持负幂运算')
      }
      
      let resultData = getMatrixArray(matrixA.value)
      
      // 简化实现：仅支持正整数幂
      if (power === 0) {
        // 返回单位矩阵
        resultData = resultData.map((_, index) => {
          const row = Math.floor(index / matrixA.value.cols)
          const col = index % matrixA.value.cols
          return row === col ? 1 : 0
        })
      } else if (power > 1) {
        // 连续乘法（简化实现）
        throw new Error('当前仅支持0次和1次幂运算')
      }
      
      return {
        title: `A^${power}`,
        rows: matrixA.value.rows,
        cols: matrixA.value.cols,
        data: resultData
      }
    }
    
    const calculate = () => {
      error.value = ''
      
      try {
        let operationResult
        
        switch (selectedOperation.value) {
          case 'add':
            operationResult = matrixAddition()
            break
          case 'subtract':
            operationResult = matrixSubtraction()
            break
          case 'multiply':
            operationResult = matrixMultiplication()
            break
          case 'scalar':
            operationResult = scalarMultiplication()
            break
          case 'transpose':
            operationResult = matrixTranspose()
            break
          case 'determinant':
            operationResult = calculateDeterminant()
            break
          case 'inverse':
            operationResult = calculateInverse()
            break
          case 'power':
            operationResult = matrixPower()
            break
          default:
            return
        }
        
        result.value = {
          calculated: true,
          ...operationResult
        }
        
      } catch (e) {
        error.value = e.message
        result.value.calculated = false
      }
    }
    
    const formatNumber = (num) => {
      if (Math.abs(num) < 1e-10) return '0'
      return Math.abs(num - Math.round(num)) < 1e-10 ? Math.round(num).toString() : num.toFixed(3)
    }
    
    const copyResult = () => {
      if (!result.value.calculated) return
      
      const matrixText = result.value.data
        .map((val, index) => {
          if ((index + 1) % result.value.cols === 0) {
            return formatNumber(val) + '\n'
          }
          return formatNumber(val) + '\t'
        })
        .join('')
      
      navigator.clipboard.writeText(matrixText).then(() => {
        alert('结果已复制到剪贴板')
      })
    }
    
    const exportResult = () => {
      if (!result.value.calculated) return
      
      const csvContent = result.value.data
        .map((val, index) => {
          if ((index + 1) % result.value.cols === 0) {
            return formatNumber(val) + '\n'
          }
          return formatNumber(val) + ','
        })
        .join('')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'matrix_result.csv'
      a.click()
      URL.revokeObjectURL(url)
    }
    
    const loadExample = (example) => {
      matrixA.value = { ...example.matrixA }
      if (example.matrixB) {
        matrixB.value = { ...example.matrixB }
      }
      calculate()
    }
    
    // 监听操作类型变化
    watch(selectedOperation, () => {
      // 调整矩阵B的尺寸以匹配运算需求
      if (selectedOperation.value === 'multiply') {
        matrixB.value.rows = matrixA.value.cols
        resizeMatrix('B')
      }
      calculate()
    })
    
    // 初始计算
    calculate()
    
    return {
      selectedOperation,
      scalar,
      error,
      matrixA,
      matrixB,
      result,
      operations,
      examples,
      needsMatrixB,
      needsScalar,
      resizeMatrix,
      fillRandom,
      fillIdentity,
      clearMatrix,
      calculate,
      formatNumber,
      copyResult,
      exportResult,
      loadExample
    }
  }
}
</script>

<style scoped>
.matrix-math {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.math-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.matrix-setup {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.matrix-setup h3 {
  margin: 0 0 1.5rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.operation-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.operation-tab {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.operation-tab:hover {
  background: rgba(255, 255, 255, 0.2);
}

.operation-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.matrix-size-controls {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.size-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.size-group label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.size-group select {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
}

.matrices-input {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  align-items: start;
}

.matrix-section, .scalar-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.matrix-section h4, .scalar-section h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  font-size: 1.1rem;
}

.matrix-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.matrix-bracket {
  font-size: 2rem;
  color: #667eea;
  font-weight: bold;
}

.matrix-grid {
  display: grid;
  gap: 0.25rem;
  align-items: center;
}

.matrix-cell {
  width: 60px;
  height: 40px;
  padding: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  text-align: center;
  font-size: 0.9rem;
}

.matrix-cell:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.matrix-tools {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.tool-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.tool-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.scalar-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  text-align: center;
  font-size: 1.2rem;
}

.result-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.result-section h3 {
  margin: 0 0 1.5rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.result-header {
  text-align: center;
  margin-bottom: 1rem;
}

.result-header h4 {
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
}

.result-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.result-matrix {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.result-cell {
  width: 80px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  color: #667eea;
  font-weight: 500;
  font-family: monospace;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.result-properties {
  margin-bottom: 1.5rem;
}

.result-properties h5 {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.9);
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.property-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.property-item label {
  color: rgba(255, 255, 255, 0.8);
}

.property-item span {
  color: #667eea;
  font-family: monospace;
}

.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.error-section {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  color: #f44336;
}

.error-section h4 {
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.examples-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.examples-section h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.example-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.example-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.example-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.example-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.example-size {
  color: #667eea;
  font-size: 0.8rem;
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
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .operation-tabs {
    justify-content: center;
  }
  
  .matrix-size-controls {
    justify-content: center;
  }
  
  .matrices-input {
    grid-template-columns: 1fr;
  }
  
  .matrix-cell {
    width: 50px;
    height: 35px;
    font-size: 0.8rem;
  }
  
  .result-cell {
    width: 60px;
    height: 35px;
    font-size: 0.8rem;
  }
  
  .examples-grid {
    grid-template-columns: 1fr;
  }
  
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style> 