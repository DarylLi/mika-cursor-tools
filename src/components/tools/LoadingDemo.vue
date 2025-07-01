<template>
  <div class="loading-demo">
    <div class="card demo-card">
      <h3><i class="fas fa-spinner"></i> 加载图标演示</h3>
      <p>选择您喜欢的加载动画效果：</p>
      
      <div class="loading-showcase">
        <!-- 1. 脉冲点加载器 -->
        <div class="demo-item">
          <div class="demo-preview">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="demo-info">
            <h4>脉冲点</h4>
            <p>简洁优雅的点状加载动画</p>
            <code>&lt;div class="loading-dots"&gt;</code>
          </div>
        </div>

        <!-- 2. 波浪加载器 -->
        <div class="demo-item">
          <div class="demo-preview">
            <div class="loading-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="demo-info">
            <h4>波浪条</h4>
            <p>音频可视化风格的波浪动画</p>
            <code>&lt;div class="loading-wave"&gt;</code>
          </div>
        </div>

        <!-- 3. 圆环加载器 -->
        <div class="demo-item">
          <div class="demo-preview">
            <div class="loading-ring"></div>
          </div>
          <div class="demo-info">
            <h4>双圆环</h4>
            <p>经典的双层旋转圆环效果</p>
            <code>&lt;div class="loading-ring"&gt;</code>
          </div>
        </div>

        <!-- 4. 弹跳球加载器 -->
        <div class="demo-item">
          <div class="demo-preview">
            <div class="loading-bounce">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="demo-info">
            <h4>弹跳球</h4>
            <p>活泼有趣的弹跳球动画</p>
            <code>&lt;div class="loading-bounce"&gt;</code>
          </div>
        </div>

        <!-- 5. 渐变圆环加载器 -->
        <div class="demo-item">
          <div class="demo-preview">
            <div class="loading-gradient"></div>
          </div>
          <div class="demo-info">
            <h4>渐变圆环</h4>
            <p>现代化的渐变圆环加载器</p>
            <code>&lt;div class="loading-gradient"&gt;</code>
          </div>
        </div>

        <!-- 6. 方块翻转加载器 -->
        <div class="demo-item">
          <div class="demo-preview">
            <div class="loading-flip"></div>
          </div>
          <div class="demo-info">
            <h4>翻转方块</h4>
            <p>3D翻转效果的方块动画</p>
            <code>&lt;div class="loading-flip"&gt;</code>
          </div>
        </div>
      </div>

      <!-- 使用示例 -->
      <div class="usage-examples">
        <h4><i class="fas fa-code"></i> 使用示例</h4>
        <div class="example-grid">
          <div class="example-item">
            <h5>按钮加载状态</h5>
            <div class="demo-button">
              <button class="btn-primary" :disabled="isLoading" @click="toggleLoading">
                <div v-if="isLoading" class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <i v-else class="fas fa-play"></i>
                {{ isLoading ? '处理中...' : '开始处理' }}
              </button>
            </div>
          </div>

          <div class="example-item">
            <h5>加载文本</h5>
            <div class="loading-text">
              <div class="loading-wave">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              正在加载数据...
            </div>
          </div>

          <div class="example-item">
            <h5>内容覆盖</h5>
            <div class="content-loading">
              <div v-if="contentLoading" class="loading-overlay">
                <div class="loading-gradient"></div>
                <span>加载中</span>
              </div>
              <div class="content">
                <p>这里是内容区域</p>
                <button @click="toggleContentLoading">
                  {{ contentLoading ? '停止加载' : '开始加载' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义颜色示例 -->
      <div class="color-examples">
        <h4><i class="fas fa-palette"></i> 颜色变体</h4>
        <div class="color-grid">
          <div class="color-demo">
            <div class="loading-ring" style="border-top-color: #ef4444; border-right-color: #ef4444;"></div>
            <span>红色</span>
          </div>
          <div class="color-demo">
            <div class="loading-bounce">
              <span style="background: #10b981;"></span>
              <span style="background: #10b981;"></span>
              <span style="background: #10b981;"></span>
            </div>
            <span>绿色</span>
          </div>
          <div class="color-demo">
            <div class="loading-dots">
              <span style="background: #f59e0b;"></span>
              <span style="background: #f59e0b;"></span>
              <span style="background: #f59e0b;"></span>
            </div>
            <span>橙色</span>
          </div>
          <div class="color-demo">
            <div class="loading-flip" style="background: #8b5cf6;"></div>
            <span>紫色</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'LoadingDemo',
  setup() {
    const isLoading = ref(false)
    const contentLoading = ref(false)

    const toggleLoading = () => {
      isLoading.value = true
      setTimeout(() => {
        isLoading.value = false
      }, 3000)
    }

    const toggleContentLoading = () => {
      contentLoading.value = !contentLoading.value
    }

    return {
      isLoading,
      contentLoading,
      toggleLoading,
      toggleContentLoading
    }
  }
}
</script>

<style scoped>
.loading-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.demo-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.demo-card h3 {
  color: #1e293b;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.demo-card h3 i {
  color: #3b82f6;
  margin-right: 10px;
}

.loading-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.demo-item {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(203, 213, 225, 0.5);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.demo-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  background: rgba(255, 255, 255, 0.9);
}

.demo-preview {
  padding: 30px;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

.demo-info h4 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 1.1rem;
}

.demo-info p {
  margin: 0 0 10px 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.demo-info code {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  display: inline-block;
}

.usage-examples {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(203, 213, 225, 0.5);
}

.usage-examples h4 {
  color: #1e293b;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.example-item {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(203, 213, 225, 0.3);
}

.example-item h5 {
  margin: 0 0 15px 0;
  color: #374151;
  font-size: 1rem;
}

.demo-button {
  text-align: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.content-loading {
  position: relative;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
  padding: 20px;
  min-height: 100px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(2px);
}

.color-examples {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(203, 213, 225, 0.5);
}

.color-examples h4 {
  color: #1e293b;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.color-grid {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.color-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(203, 213, 225, 0.3);
}

.color-demo span {
  font-size: 0.9rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .loading-showcase {
    grid-template-columns: 1fr;
  }
  
  .example-grid {
    grid-template-columns: 1fr;
  }
  
  .color-grid {
    justify-content: space-around;
  }
  
  .demo-card {
    padding: 20px;
  }
}
</style> 