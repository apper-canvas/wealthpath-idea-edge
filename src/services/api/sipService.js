import sipData from "@/services/mockData/sips.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sipService = {
  async getAll() {
    await delay(300);
    return sipData.map(sip => ({ ...sip }));
  },
  
  async getById(id) {
    await delay(200);
    const sip = sipData.find(s => s.Id === parseInt(id));
    if (!sip) {
      throw new Error(`SIP with Id ${id} not found`);
    }
    return { ...sip };
  },
  
  async create(sip) {
    await delay(350);
    const newId = Math.max(...sipData.map(s => s.Id)) + 1;
    const newSip = { 
      Id: newId, 
      ...sip,
      status: 'active',
      createdAt: new Date().toISOString(),
      nextInvestmentDate: sip.startDate
    };
    sipData.push(newSip);
    return { ...newSip };
  },
  
  async update(id, data) {
    await delay(300);
    const index = sipData.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`SIP with Id ${id} not found`);
    }
    
    sipData[index] = { ...sipData[index], ...data };
    return { ...sipData[index] };
  },
  
  async delete(id) {
    await delay(250);
    const index = sipData.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`SIP with Id ${id} not found`);
    }
    
    const deleted = sipData.splice(index, 1)[0];
    return { ...deleted };
  },
  
  async getByGoal(goalId) {
    await delay(280);
    return sipData.filter(sip => sip.goalId === parseInt(goalId)).map(sip => ({ ...sip }));
  },
  
  async toggleStatus(id) {
    await delay(250);
    const index = sipData.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`SIP with Id ${id} not found`);
    }
    
    sipData[index].status = sipData[index].status === 'active' ? 'paused' : 'active';
    return { ...sipData[index] };
  },

  async getActiveSips() {
    await delay(200);
    return sipData.filter(sip => sip.status === 'active').map(sip => ({ ...sip }));
  },

  async getTotalMonthlyCommitment() {
    await delay(200);
    const activeSips = sipData.filter(sip => sip.status === 'active');
    return activeSips.reduce((total, sip) => {
      if (sip.frequency === 'monthly') return total + sip.amount;
      if (sip.frequency === 'weekly') return total + (sip.amount * 4.33);
      if (sip.frequency === 'daily') return total + (sip.amount * 30);
      return total;
    }, 0);
  }
};