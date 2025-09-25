<template>
  <div v-if="visible" class="message-overlay" @click="close">
    <div class="message-container" @click.stop>
      <div class="message-content" :class="typeClass">
        <div class="message-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="message-text">
          <div class="message-title">{{ title }}</div>
          <div class="message-body">{{ message }}</div>
        </div>
        <button class="message-close" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'Message',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 3000
    },
    closable: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const visible = ref(false)
    let timer = null

    const typeClass = computed(() => `message-${props.type}`)
    
    const iconClass = computed(() => {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[props.type] || icons.info
    })

    const show = () => {
      visible.value = true
      
      if (props.duration > 0) {
        timer = setTimeout(() => {
          close()
        }, props.duration)
      }
    }

    const close = () => {
      visible.value = false
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      emit('close')
    }

    onMounted(() => {
      show()
    })

    return {
      visible,
      typeClass,
      iconClass,
      close
    }
  }
}
</script>

<style scoped>
.message-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.message-container {
  max-width: 500px;
  width: 90%;
  animation: slideIn 0.3s ease;
}

.message-content {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
}

.message-success {
  border-left: 4px solid #10b981;
}

.message-error {
  border-left: 4px solid #ef4444;
}

.message-warning {
  border-left: 4px solid #f59e0b;
}

.message-info {
  border-left: 4px solid #3b82f6;
}

.message-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.message-success .message-icon {
  color: #10b981;
}

.message-error .message-icon {
  color: #ef4444;
}

.message-warning .message-icon {
  color: #f59e0b;
}

.message-info .message-icon {
  color: #3b82f6;
}

.message-text {
  flex: 1;
}

.message-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.message-body {
  color: #6b7280;
  line-height: 1.5;
}

.message-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.message-close:hover {
  color: #6b7280;
  background: #f3f4f6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 深色主题适配 */
:global(.dark-theme) .message-content {
  background: #1f2937;
  color: #f9fafb;
}

:global(.dark-theme) .message-title {
  color: #f9fafb;
}

:global(.dark-theme) .message-body {
  color: #d1d5db;
}

:global(.dark-theme) .message-close {
  color: #9ca3af;
}

:global(.dark-theme) .message-close:hover {
  color: #d1d5db;
  background: #374151;
}
</style>
