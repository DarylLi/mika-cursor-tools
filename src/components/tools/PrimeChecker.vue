<template>
  <div class="prime-checker">
    <div class="checker-container">
      <!-- 质数检查主工具 -->
      <div class="main-checker">
        <h3><i class="fas fa-search"></i> 质数检查器</h3>
        <div class="input-section">
          <div class="number-input">
            <input 
              v-model="inputNumber" 
              type="number" 
              min="1"
              max="1000000"
              placeholder="输入一个正整数..."
              @input="checkPrime"
              class="main-input">
            <button @click="checkPrime" class="check-btn">
              <i class="fas fa-play"></i>
              检查
            </button>
          </div>
          
          <div v-if="result.checked" class="result-display">
            <div :class="['result-badge', result.isPrime ? 'is-prime' : 'not-prime']">
              <i :class="result.isPrime ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
              {{ result.number }} {{ result.isPrime ? '是质数' : '不是质数' }}
            </div>
            
            <div v-if="!result.isPrime && result.factors.length > 0" class="factors-info">
              <strong>因子分解：</strong>
              <span class="factors">{{ result.number }} = {{ result.factorization }}</span>
            </div>
            
            <div class="additional-info">
              <div class="info-grid">
                <div class="info-item">
                  <label>位数：</label>
                  <span>{{ result.digits }}</span>
                </div>
                <div class="info-item">
                  <label>奇偶性：</label>
                  <span>{{ result.number % 2 === 0 ? '偶数' : '奇数' }}</span>
                </div>
                <div v-if="result.isPrime" class="info-item">
                  <label>质数序号：</label>
                  <span>第 {{ result.primeIndex }} 个质数</span>
                </div>
                <div class="info-item">
                  <label>平方根：</label>
                  <span>{{ Math.sqrt(result.number).toFixed(3) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 质数范围生成器 -->
      <div class="range-generator">
        <h3><i class="fas fa-list"></i> 质数范围生成</h3>
        <div class="range-inputs">
          <div class="input-group">
            <label>起始数：</label>
            <input v-model="rangeStart" type="number" min="1" max="10000" placeholder="如：1">
          </div>
          <div class="input-group">
            <label>结束数：</label>
            <input v-model="rangeEnd" type="number" min="1" max="10000" placeholder="如：100">
          </div>
          <button @click="generatePrimesInRange" class="generate-btn">
            <i class="fas fa-magic"></i>
            生成质数
          </button>
        </div>
        
        <div v-if="primeList.length > 0" class="prime-list-section">
          <div class="list-header">
            <h4>{{ rangeStart }} 到 {{ rangeEnd }} 之间的质数（共 {{ primeList.length }} 个）</h4>
            <button @click="copyPrimeList" class="copy-btn">
              <i class="fas fa-copy"></i>
              复制列表
            </button>
          </div>
          <div class="prime-grid">
            <span 
              v-for="prime in primeList" 
              :key="prime"
              @click="selectPrime(prime)"
              :class="['prime-item', { selected: selectedPrime === prime }]">
              {{ prime }}
            </span>
          </div>
        </div>
      </div>

      <!-- 快速质数工具 -->
      <div class="quick-tools">
        <h3><i class="fas fa-bolt"></i> 快速工具</h3>
        <div class="tools-grid">
          <div class="tool-card" @click="findNextPrime">
            <i class="fas fa-arrow-right"></i>
            <div>
              <strong>下一个质数</strong>
              <p>找到大于当前数的下一个质数</p>
            </div>
          </div>
          <div class="tool-card" @click="findPrevPrime">
            <i class="fas fa-arrow-left"></i>
            <div>
              <strong>上一个质数</strong>
              <p>找到小于当前数的上一个质数</p>
            </div>
          </div>
          <div class="tool-card" @click="generateRandomPrime">
            <i class="fas fa-dice"></i>
            <div>
              <strong>随机质数</strong>
              <p>生成指定范围内的随机质数</p>
            </div>
          </div>
          <div class="tool-card" @click="showFactorization">
            <i class="fas fa-sitemap"></i>
            <div>
              <strong>因式分解</strong>
              <p>分解为质因数</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 前100个质数 -->
      <div class="first-primes">
        <h3><i class="fas fa-star"></i> 前100个质数</h3>
        <div class="primes-grid">
          <span 
            v-for="(prime, index) in first100Primes" 
            :key="prime"
            @click="selectPrime(prime)"
            :class="['prime-number', { selected: selectedPrime === prime }]"
            :title="`第${index + 1}个质数`">
            {{ prime }}
          </span>
        </div>
      </div>

      <!-- 质数算法测试 -->
      <div class="algorithm-test">
        <h3><i class="fas fa-stopwatch"></i> 算法性能测试</h3>
        <div class="test-controls">
          <div class="input-group">
            <label>测试范围：</label>
            <select v-model="testRange">
              <option value="1000">1 - 1,000</option>
              <option value="10000">1 - 10,000</option>
              <option value="100000">1 - 100,000</option>
            </select>
          </div>
          <button @click="runPerformanceTest" :disabled="testing" class="test-btn">
            <div v-if="testing" class="loading-ring"></div>
            <i v-else class="fas fa-play"></i>
            {{ testing ? '测试中...' : '开始测试' }}
          </button>
        </div>
        
        <div v-if="testResult" class="test-results">
          <div class="result-item">
            <label>找到质数：</label>
            <span>{{ testResult.count }} 个</span>
          </div>
          <div class="result-item">
            <label>用时：</label>
            <span>{{ testResult.time }} ms</span>
          </div>
          <div class="result-item">
            <label>算法：</label>
            <span>{{ testResult.algorithm }}</span>
          </div>
        </div>
      </div>

      <!-- 质数知识 -->
      <div class="knowledge-section">
        <h3><i class="fas fa-book"></i> 质数知识</h3>
        <div class="knowledge-grid">
          <div class="knowledge-card">
            <i class="fas fa-info-circle"></i>
            <div>
              <strong>质数定义</strong>
              <p>大于1的自然数，只有1和它本身两个因数</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-chart-line"></i>
            <div>
              <strong>质数定理</strong>
              <p>小于n的质数个数大约为 n/ln(n)</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-infinity"></i>
            <div>
              <strong>欧几里得证明</strong>
              <p>质数有无穷多个</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-puzzle-piece"></i>
            <div>
              <strong>孪生质数</strong>
              <p>相差2的质数对，如(3,5)、(5,7)、(11,13)</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-key"></i>
            <div>
              <strong>应用</strong>
              <p>密码学、RSA加密算法的基础</p>
            </div>
          </div>
          <div class="knowledge-card">
            <i class="fas fa-calculator"></i>
            <div>
              <strong>检测算法</strong>
              <p>试除法、埃拉托斯特尼筛法、米勒-拉宾测试</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, getCurrentInstance } from 'vue'

export default {
  name: 'PrimeChecker',
  setup() {
    const instance = getCurrentInstance()
    const inputNumber = ref('')
    const rangeStart = ref(1)
    const rangeEnd = ref(100)
    const selectedPrime = ref(null)
    const testRange = ref('1000')
    const testing = ref(false)
    
    const result = ref({
      checked: false,
      number: null,
      isPrime: false,
      factors: [],
      factorization: '',
      digits: 0,
      primeIndex: 0
    })
    
    const primeList = ref([])
    const testResult = ref(null)
    
    // 前100个质数
    const first100Primes = [
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
      73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
      157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
      239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
      331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
      421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
      509, 521, 523, 541
    ]
    
    // 检查是否为质数
    const isPrime = (n) => {
      if (n < 2) return false
      if (n === 2) return true
      if (n % 2 === 0) return false
      
      for (let i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i === 0) return false
      }
      return true
    }
    
    // 质因数分解
    const primeFactorization = (n) => {
      const factors = []
      let temp = n
      
      // 检查2
      while (temp % 2 === 0) {
        factors.push(2)
        temp /= 2
      }
      
      // 检查奇数因子
      for (let i = 3; i <= Math.sqrt(temp); i += 2) {
        while (temp % i === 0) {
          factors.push(i)
          temp /= i
        }
      }
      
      if (temp > 2) {
        factors.push(temp)
      }
      
      return factors
    }
    
    // 格式化因式分解
    const formatFactorization = (factors) => {
      const factorCount = {}
      factors.forEach(factor => {
        factorCount[factor] = (factorCount[factor] || 0) + 1
      })
      
      return Object.entries(factorCount)
        .map(([factor, count]) => count > 1 ? `${factor}^${count}` : factor)
        .join(' × ')
    }
    
    // 找到质数在质数序列中的位置
    const findPrimeIndex = (n) => {
      let count = 0
      for (let i = 2; i <= n; i++) {
        if (isPrime(i)) {
          count++
          if (i === n) return count
        }
      }
      return 0
    }
    
    // 检查质数
    const checkPrime = () => {
      const num = parseInt(inputNumber.value)
      if (isNaN(num) || num < 1) {
        result.value.checked = false
        return
      }
      
      const factors = primeFactorization(num)
      
      result.value = {
        checked: true,
        number: num,
        isPrime: isPrime(num),
        factors: factors,
        factorization: formatFactorization(factors),
        digits: num.toString().length,
        primeIndex: isPrime(num) ? findPrimeIndex(num) : 0
      }
      
      selectedPrime.value = num
    }
    
    // 生成范围内的质数
    const generatePrimesInRange = () => {
      const start = parseInt(rangeStart.value) || 1
      const end = parseInt(rangeEnd.value) || 100
      
      if (start > end || end - start > 10000) {
        instance.proxy.$message.success('请输入有效范围（最大10000个数字）')
        return
      }
      
      const primes = []
      for (let i = Math.max(start, 2); i <= end; i++) {
        if (isPrime(i)) {
          primes.push(i)
        }
      }
      
      primeList.value = primes
    }
    
    // 选择质数
    const selectPrime = (prime) => {
      selectedPrime.value = prime
      inputNumber.value = prime.toString()
      checkPrime()
    }
    
    // 复制质数列表
    const copyPrimeList = () => {
      const text = primeList.value.join(', ')
      navigator.clipboard.writeText(text).then(() => {
        instance.proxy.$message.success('质数列表已复制到剪贴板')
      })
    }
    
    // 找下一个质数
    const findNextPrime = () => {
      const num = parseInt(inputNumber.value) || 2
      let next = num + 1
      while (!isPrime(next)) {
        next++
      }
      inputNumber.value = next.toString()
      checkPrime()
    }
    
    // 找上一个质数
    const findPrevPrime = () => {
      const num = parseInt(inputNumber.value) || 3
      let prev = Math.max(num - 1, 2)
      while (prev >= 2 && !isPrime(prev)) {
        prev--
      }
      if (prev >= 2) {
        inputNumber.value = prev.toString()
        checkPrime()
      }
    }
    
    // 生成随机质数
    const generateRandomPrime = () => {
      const randomIndex = Math.floor(Math.random() * first100Primes.length)
      const randomPrime = first100Primes[randomIndex]
      inputNumber.value = randomPrime.toString()
      checkPrime()
    }
    
    // 显示因式分解
    const showFactorization = () => {
      if (!result.value.checked) {
        instance.proxy.$message.success('请先输入一个数字进行检查')
        return
      }
      
      if (result.value.isPrime) {
        instance.proxy.$message.success(`${result.value.number} 是质数，只能分解为 1 × ${result.value.number}`)
      } else {
        instance.proxy.$message.success(`${result.value.number} = ${result.value.factorization}`)
      }
    }
    
    // 性能测试
    const runPerformanceTest = async () => {
      testing.value = true
      const limit = parseInt(testRange.value)
      
      const startTime = performance.now()
      let count = 0
      
      for (let i = 2; i <= limit; i++) {
        if (isPrime(i)) {
          count++
        }
      }
      
      const endTime = performance.now()
      
      testResult.value = {
        count: count,
        time: (endTime - startTime).toFixed(2),
        algorithm: '试除法优化版'
      }
      
      testing.value = false
    }
    
    return {
      inputNumber,
      rangeStart,
      rangeEnd,
      selectedPrime,
      testRange,
      testing,
      result,
      primeList,
      testResult,
      first100Primes,
      checkPrime,
      generatePrimesInRange,
      selectPrime,
      copyPrimeList,
      findNextPrime,
      findPrevPrime,
      generateRandomPrime,
      showFactorization,
      runPerformanceTest
    }
  }
}
</script>

<style scoped>
.prime-checker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.checker-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.main-checker {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.main-checker h3 {
  margin: 0 0 1.5rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.number-input {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.main-input {
  flex: 1;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.main-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.check-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.check-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.result-display {
  text-align: center;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.result-badge.is-prime {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.result-badge.not-prime {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.factors-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.factors {
  font-family: monospace;
  color: #667eea;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.info-item label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.info-item span {
  color: #667eea;
  font-weight: 500;
}

.range-generator {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.range-generator h3 {
  margin: 0 0 1.5rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-inputs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: end;
}

.input-group {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.input-group label {
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.input-group input, .input-group select {
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
}

.generate-btn, .copy-btn, .test-btn {
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
  white-space: nowrap;
}

.generate-btn:hover, .copy-btn:hover, .test-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.list-header h4 {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.prime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.5rem;
}

.prime-item {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.prime-item:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.prime-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.3);
}

.quick-tools {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quick-tools h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.tool-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tool-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.tool-card i {
  color: #667eea;
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.tool-card strong {
  color: rgba(255, 255, 255, 0.9);
  display: block;
  margin-bottom: 0.25rem;
}

.tool-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.first-primes {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.first-primes h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.primes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 0.5rem;
}

.prime-number {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  font-size: 0.9rem;
}

.prime-number:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

.prime-number.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.3);
}

.algorithm-test {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.algorithm-test h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.test-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.test-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.result-item {
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.result-item label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.result-item span {
  color: #667eea;
  font-weight: 500;
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
  .number-input {
    flex-direction: column;
  }
  
  .range-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .list-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .test-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style> 