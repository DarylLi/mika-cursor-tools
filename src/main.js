import { createApp } from "vue";
import App from "./App.vue";
import "./style.scss";

// 移除加载动画
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const loading = document.getElementById("loading");
    if (loading) {
      loading.style.display = "none";
    }
  }, 1000);
});

createApp(App).mount("#app");
