<template>
  <div class="background-animation">
    <!-- Gatitos -->
    <div v-for="n in numCats" :key="'cat' + n" class="cat"></div>
    <!-- Huellitas -->
    <div v-for="n in numPaws" :key="'paw' + n" class="paw"></div>
  </div>
</template>

<script setup>
defineProps({
  numCats: { type: Number, default: 10 },
  numPaws: { type: Number, default: 15 }
})
</script>

<style scoped>
/* Fondo animado (todo el CSS del fondo va aquí, scoped para no afectar otras páginas) */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;  /* Detrás del contenido */
}

.paw {
  position: absolute;
  bottom: -50px;
  width: 32px;
  height: 32px;
  background-image: url('https://cdn-icons-png.flaticon.com/512/616/616408.png');
  background-size: cover;
  opacity: 0.3;
  animation: floatUp linear infinite;
  z-index: 1;
}

/* Posiciones y velocidades para huellitas (ajusta si usas menos que 15) */
.paw:nth-of-type(1) { animation-duration: 12s; left: 10%; }
.paw:nth-of-type(2) { animation-duration: 15s; left: 60%; }
.paw:nth-of-type(3) { animation-duration: 10s; left: 30%; }
.paw:nth-of-type(4) { animation-duration: 18s; left: 80%; }
.paw:nth-of-type(5) { animation-duration: 13s; left: 50%; }
.paw:nth-of-type(6) { animation-duration: 16s; left: 70%; }
.paw:nth-of-type(7) { animation-duration: 14s; left: 40%; }
.paw:nth-of-type(8) { animation-duration: 11s; left: 90%; }
.paw:nth-of-type(9) { animation-duration: 17s; left: 20%; }
.paw:nth-of-type(10) { animation-duration: 9s; left: 55%; }
.paw:nth-of-type(11) { animation-duration: 20s; left: 5%; }
.paw:nth-of-type(12) { animation-duration: 13s; left: 75%; }
/* Si usas menos de 15, los extras no se aplican —está bien */

.cat {
  position: absolute;
  bottom: -80px;
  width: 50px;
  height: 50px;
  opacity: 0.6;
  animation: floatUpCat linear infinite;
  z-index: 1;
}

.cat::before {
  content: '🐱';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 50px;
  line-height: 1;
}

/* Posiciones y velocidades para gatitos (ajusta si usas menos que 10) */
.cat:nth-of-type(1) { animation-duration: 20s; left: 15%; }
.cat:nth-of-type(2) { animation-duration: 25s; left: 45%; }
.cat:nth-of-type(3) { animation-duration: 18s; left: 70%; }
.cat:nth-of-type(4) { animation-duration: 22s; left: 5%; }
.cat:nth-of-type(5) { animation-duration: 28s; left: 85%; }
.cat:nth-of-type(6) { animation-duration: 19s; left: 35%; }
.cat:nth-of-type(7) { animation-duration: 24s; left: 65%; }
.cat:nth-of-type(8) { animation-duration: 21s; left: 25%; }
/* Si usas menos de 10, los extras no se aplican —está bien */

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-110vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes floatUpCat {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-20vh) rotate(-15deg) scale(1.1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-50vh) rotate(0deg) scale(0.95);
    opacity: 0.9;
  }
  75% {
    transform: translateY(-80vh) rotate(15deg) scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-110vh) rotate(360deg) scale(1);
    opacity: 0;
  }
}
</style>
