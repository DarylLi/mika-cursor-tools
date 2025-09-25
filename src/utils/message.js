import { createApp } from "vue";
import Message from "../components/Message.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";

class MessageService {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // 创建消息容器
    this.container = document.createElement("div");
    this.container.id = "message-container";
    document.body.appendChild(this.container);
  }

  show(options) {
    const app = createApp(Message, {
      ...options,
      onClose: () => {
        app.unmount();
        this.container.removeChild(this.container.lastChild);
      },
    });

    const instance = app.mount(document.createElement("div"));
    this.container.appendChild(instance.$el);
  }

  success(message, title = "成功") {
    this.show({
      type: "success",
      title,
      message,
    });
  }

  error(message, title = "错误") {
    this.show({
      type: "error",
      title,
      message,
    });
  }

  warning(message, title = "警告") {
    this.show({
      type: "warning",
      title,
      message,
    });
  }

  info(message, title = "提示") {
    this.show({
      type: "info",
      title,
      message,
    });
  }

  confirm(message, title = "确认") {
    return new Promise((resolve) => {
      const app = createApp(ConfirmDialog, {
        title,
        message,
        onConfirm: () => {
          app.unmount();
          document.body.removeChild(document.body.lastChild);
          resolve(true);
        },
        onCancel: () => {
          app.unmount();
          document.body.removeChild(document.body.lastChild);
          resolve(false);
        },
      });

      const instance = app.mount(document.createElement("div"));
      document.body.appendChild(instance.$el);
    });
  }
}

// 创建全局实例
const messageService = new MessageService();

// 全局方法
export const showMessage = (message, type = "info", title = "") => {
  const titles = {
    success: "成功",
    error: "错误",
    warning: "警告",
    info: "提示",
  };

  messageService.show({
    type,
    title: title || titles[type],
    message,
  });
};

export const showSuccess = (message, title = "成功") => {
  messageService.success(message, title);
};

export const showError = (message, title = "错误") => {
  messageService.error(message, title);
};

export const showWarning = (message, title = "警告") => {
  messageService.warning(message, title);
};

export const showInfo = (message, title = "提示") => {
  messageService.info(message, title);
};

export const showConfirm = (message, title = "确认") => {
  return messageService.confirm(message, title);
};

export default messageService;
