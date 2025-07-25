import goalsData from "@/services/mockData/goals.json";
import React from "react";
import Error from "@/components/ui/Error";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const goalsService = {
  async getAll() {
    await delay(300);
    return goalsData.map(goal => ({ ...goal }));
  },
  
  async getById(id) {
    await delay(200);
    const goal = goalsData.find(g => g.Id === parseInt(id));
    if (!goal) {
      throw new Error(`Goal with Id ${id} not found`);
    }
    return { ...goal };
  },
  
  async create(goal) {
    await delay(350);
    const newId = Math.max(...goalsData.map(g => g.Id)) + 1;
    const newGoal = { Id: newId, ...goal };
    goalsData.push(newGoal);
    return { ...newGoal };
  },
  
  async update(id, data) {
    await delay(300);
    const index = goalsData.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Goal with Id ${id} not found`);
    }
    
    goalsData[index] = { ...goalsData[index], ...data };
    return { ...goalsData[index] };
  },
  
  async delete(id) {
    await delay(250);
    const index = goalsData.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Goal with Id ${id} not found`);
    }
    
    const deleted = goalsData.splice(index, 1)[0];
    return { ...deleted };
  },
  
  async getByCategory(category) {
    await delay(280);
    return goalsData.filter(goal => goal.category === category).map(goal => ({ ...goal }));
  },
  
  async updateProgress(id, currentAmount) {
    await delay(250);
    const index = goalsData.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Goal with Id ${id} not found`);
    }
goalsData[index].currentAmount = currentAmount;
    return { ...goalsData[index] };
  },

  async getSipGoals() {
    await delay(200);
    return goalsData.map(goal => ({
      Id: goal.Id,
      name: goal.name,
      category: goal.category,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount
    }));
  }
};