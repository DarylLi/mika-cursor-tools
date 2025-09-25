<template>
  <transition name="confirm-fade">
    <div v-if="visible" class="confirm-overlay" @click="handleOverlayClick">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="confirm-body">
          <p>{{ message }}</p>
        </div>
        <div class="confirm-footer">
          <button class="confirm-btn cancel-btn" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button class="confirm-btn confirm-btn-primary" @click="handleConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'ConfirmDialog',
  props: {
    title: {
      type: String,
      default: '确认'
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    }
  },
  emits: ['confirm', 'cancel', 'close'],
  setup(props, { emit }) {
    const visible = ref(false);

    const handleConfirm = () => {
      visible.value = false;
      emit('confirm');
    };

    const handleCancel = () => {
      visible.value = false;
      emit('cancel');
    };

    const handleOverlayClick = () => {
      handleCancel();
    };

    const show = () => {
      visible.value = true;
    };

    const hide = () => {
      visible.value = false;
    };

    onMounted(() => {
      show();
    });

    return {
      visible,
      handleConfirm,
      handleCancel,
      handleOverlayClick
    };
  }
};
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  min-width: 320px;
  max-width: 90%;
  overflow: hidden;
}

.confirm-header {
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #eee;
}

.confirm-header h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.confirm-body {
  padding: 20px;
}

.confirm-body p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.confirm-footer {
  padding: 15px 20px 20px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.confirm-btn-primary {
  background: #007bff;
  color: white;
}

.confirm-btn-primary:hover {
  background: #0056b3;
}

/* Dark theme */
:global(.dark-theme) .confirm-dialog {
  background: #2d2d2d;
  color: #fff;
}

:global(.dark-theme) .confirm-header {
  border-bottom-color: #444;
}

:global(.dark-theme) .confirm-header h3 {
  color: #fff;
}

:global(.dark-theme) .confirm-body p {
  color: #ccc;
}

:global(.dark-theme) .cancel-btn {
  background: #444;
  color: #ccc;
}

:global(.dark-theme) .cancel-btn:hover {
  background: #555;
}

/* Transition */
.confirm-fade-enter-active, .confirm-fade-leave-active {
  transition: all 0.3s ease;
}

.confirm-fade-enter-from, .confirm-fade-leave-to {
  opacity: 0;
}

.confirm-fade-enter-from .confirm-dialog, .confirm-fade-leave-to .confirm-dialog {
  transform: scale(0.9);
}
</style>
