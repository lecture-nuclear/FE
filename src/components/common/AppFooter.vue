<!-- src/components/common/AppFooter.vue -->
<template>
  <footer class="app-footer">
    <div class="footer-main">
      <div class="footer-container">
        <p>안녕하세요</p>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-container">
        <p>&copy; 2024 Lecture Platform. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer component
</script>

<style scoped>
.app-footer {
  width: 100%;
  margin-top: auto;
}

.footer-main {
  background-color: #2f3349;
  color: white;
  padding: 60px 0 40px;
}

.footer-bottom {
  background-color: #21222d;
  color: white;
  padding: 20px 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-main p {
  font-size: 1.2rem;
  margin: 0;
  font-weight: 400;
}

.footer-bottom p {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.8;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .footer-main {
    padding: 40px 0 30px;
  }
  
  .footer-container {
    padding: 0 15px;
  }
  
  .footer-main p {
    font-size: 1.1rem;
  }
  
  .footer-bottom p {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .footer-main {
    padding: 30px 0 20px;
  }
  
  .footer-container {
    padding: 0 10px;
  }
  
  .footer-main p {
    font-size: 1rem;
  }
}
</style>