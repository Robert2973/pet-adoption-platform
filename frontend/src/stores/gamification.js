// src/stores/gamification.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useGamificationStore = defineStore('gamification', () => {
  const points = ref(0);
  const achievements = ref([]);

  const addPoints = (amount) => {
    if (amount > 0) {
      points.value += amount;
      console.log(`+${amount} puntos. Total: ${points.value}`);
      checkAchievements();  // Check badges por level
    }
  };

  const unlockAchievement = (name) => {
    if (name && !achievements.value.includes(name)) {
      achievements.value.push(name);
      console.log(`¡Badge unlocked: ${name}! (Level ${level.value})`);
    }
  };

  const checkAchievements = () => {
    const currentLevel = level.value;
    if (currentLevel >= 1 && !achievements.value.includes('Adoptador Novato')) {
      unlockAchievement('Adoptador Novato');
    }
    if (currentLevel >= 2 && !achievements.value.includes('Amigo de los Animales')) {
      unlockAchievement('Amigo de los Animales');
    }
    if (currentLevel >= 3 && !achievements.value.includes('Super Adoptador')) {
      unlockAchievement('Super Adoptador');
    }
    // Agrega más levels/badges
  };

  // Getters reactivos
  const level = computed(() => Math.floor(points.value / 100) + 1);
  const progressToNextLevel = computed(() => points.value % 100);

  return {
    points,
    achievements,
    level,
    progressToNextLevel,
    addPoints,  // Backend llama +100, store actualiza UI
    unlockAchievement,
    checkAchievements
  };
});
