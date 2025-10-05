import { defineStore } from 'pinia';
import axios from 'axios';

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    points: 0,
    achievements: []
  }),
  actions: {
    async addPoints(amount, achievement = null) {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('No logueado');
        const res = await axios.put('/users/points', {
          userId,
          pointsToAdd: amount,
          achievement
        });
        this.points = res.data.points;
        this.achievements = res.data.achievements;
        console.log(`+${amount} puntos! Total: ${this.points}`);
      } catch (err) {
        console.error('Error agregando puntos:', err);
      }
    },
    unlockAchievement(name) {
      if (!this.achievements.includes(name)) {
        this.achievements.push(name);
        // Opcional: Llama API para persistir si no lo hace addPoints
      }
    }
  }
});
