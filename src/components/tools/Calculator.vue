<template>
  <div class="single-tool">
    <h2><i class="fas fa-calculator"></i> 计算器</h2>
    
    <div class="example-section">
      <button class="example-btn" @click="loadExample">
        <i class="fas fa-lightbulb"></i> 演示计算
      </button>
    </div>
    
    <div class="calculator">
      <div class="calculator-display">{{ display }}</div>
      <div class="calculator-buttons">
        <button @click="clear" class="calc-btn clear">C</button>
        <button @click="handleOperator('/')" class="calc-btn operator">÷</button>
        <button @click="handleOperator('*')" class="calc-btn operator">×</button>
        <button @click="clear" class="calc-btn clear">⌫</button>
        
        <button @click="appendToDisplay('7')" class="calc-btn">7</button>
        <button @click="appendToDisplay('8')" class="calc-btn">8</button>
        <button @click="appendToDisplay('9')" class="calc-btn">9</button>
        <button @click="handleOperator('-')" class="calc-btn operator">-</button>
        
        <button @click="appendToDisplay('4')" class="calc-btn">4</button>
        <button @click="appendToDisplay('5')" class="calc-btn">5</button>
        <button @click="appendToDisplay('6')" class="calc-btn">6</button>
        <button @click="handleOperator('+')" class="calc-btn operator">+</button>
        
        <button @click="appendToDisplay('1')" class="calc-btn">1</button>
        <button @click="appendToDisplay('2')" class="calc-btn">2</button>
        <button @click="appendToDisplay('3')" class="calc-btn">3</button>
        <button @click="calculate" class="calc-btn equals">=</button>
        
        <button @click="appendToDisplay('0')" class="calc-btn zero">0</button>
        <button @click="appendDecimal" class="calc-btn">.</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Calculator',
  props: {
    toolData: Object
  },
  setup() {
    const display = ref('0')
    const previousInput = ref(null)
    const operator = ref(null)
    const waitingForNewInput = ref(false)

    const loadExample = () => {
      clear()
      
      // 模拟一个计算过程: 123 + 456 = 579
      setTimeout(() => appendToDisplay('1'), 300)
      setTimeout(() => appendToDisplay('2'), 600)
      setTimeout(() => appendToDisplay('3'), 900)
      setTimeout(() => handleOperator('+'), 1200)
      setTimeout(() => appendToDisplay('4'), 1500)
      setTimeout(() => appendToDisplay('5'), 1800)
      setTimeout(() => appendToDisplay('6'), 2100)
      setTimeout(() => calculate(), 2400)
    }

    const appendToDisplay = (value) => {
      if (waitingForNewInput.value) {
        display.value = value
        waitingForNewInput.value = false
      } else {
        display.value = display.value === '0' ? value : display.value + value
      }
    }

    const handleOperator = (op) => {
      const inputValue = parseFloat(display.value)
      
      if (previousInput.value === null) {
        previousInput.value = inputValue
      } else if (operator.value) {
        const currentValue = previousInput.value || 0
        const newValue = performCalculation(currentValue, inputValue, operator.value)
        
        display.value = String(newValue)
        previousInput.value = newValue
      }
      
      waitingForNewInput.value = true
      operator.value = op === '×' ? '*' : op === '÷' ? '/' : op
    }

    const calculate = () => {
      const inputValue = parseFloat(display.value)
      
      if (previousInput.value !== null && operator.value) {
        const newValue = performCalculation(previousInput.value, inputValue, operator.value)
        display.value = String(newValue)
        previousInput.value = null
        operator.value = null
        waitingForNewInput.value = true
      }
    }

    const performCalculation = (firstValue, secondValue, operator) => {
      switch (operator) {
        case '+':
          return firstValue + secondValue
        case '-':
          return firstValue - secondValue
        case '*':
          return firstValue * secondValue
        case '/':
          return secondValue !== 0 ? firstValue / secondValue : 0
        default:
          return secondValue
      }
    }

    const clear = () => {
      display.value = '0'
      previousInput.value = null
      operator.value = null
      waitingForNewInput.value = false
    }

    const appendDecimal = () => {
      if (waitingForNewInput.value) {
        display.value = '0.'
        waitingForNewInput.value = false
      } else if (display.value.indexOf('.') === -1) {
        display.value += '.'
      }
    }

    return {
      display,
      loadExample,
      appendToDisplay,
      handleOperator,
      calculate,
      clear,
      appendDecimal
    }
  }
}
</script> 