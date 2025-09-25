import { createApp } from "vue";
import App from "./App.vue";
import "./style.scss";
import messageService from "./utils/message.js";

// 移除加载动画
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const loading = document.getElementById("loading");
    if (loading) {
      loading.style.display = "none";
    }
  }, 1000);
});

const app = createApp(App);

// 全局属性
app.config.globalProperties.$message = messageService;

app.mount("#app");
