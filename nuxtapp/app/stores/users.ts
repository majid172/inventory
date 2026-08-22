import { defineStore } from 'pinia';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Store Admin' | 'Chief Pharmacist' | 'POS Cashier';
  status: 'Active' | 'Suspended';
  lastActive: string;
  terminalAccess: boolean;
}

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    isLoading: false,
  }),
  actions: {
    async fetchUsers() {
      this.isLoading = true;
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      this.users = [
        {
          id: 'USR_001',
          name: 'Sarah Connor',
          email: 'sarah.admin@pharmacare.com',
          role: 'Store Admin',
          status: 'Active',
          lastActive: 'Just now',
          terminalAccess: true,
        },
        {
          id: 'USR_002',
          name: 'Dr. Robert Ford',
          email: 'robert.f@pharmacare.com',
          role: 'Chief Pharmacist',
          status: 'Active',
          lastActive: '2 hours ago',
          terminalAccess: true,
        },
        {
          id: 'USR_003',
          name: 'John Doe',
          email: 'john.cashier@pharmacare.com',
          role: 'POS Cashier',
          status: 'Active',
          lastActive: '5 mins ago',
          terminalAccess: true,
        },
        {
          id: 'USR_004',
          name: 'Alice Smith',
          email: 'alice.c@pharmacare.com',
          role: 'POS Cashier',
          status: 'Suspended',
          lastActive: '3 days ago',
          terminalAccess: false,
        }
      ];
      this.isLoading = false;
    },
    
    async createUser(userData: Omit<User, 'id' | 'lastActive'>) {
      const newUser: User = {
        ...userData,
        id: `USR_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        lastActive: 'Never',
      };
      this.users.unshift(newUser);
    },
    
    async updateUser(id: string, updates: Partial<User>) {
      const index = this.users.findIndex(u => u.id === id);
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...updates };
      }
    },
    
    async toggleUserStatus(id: string) {
      const user = this.users.find(u => u.id === id);
      if (user) {
        user.status = user.status === 'Active' ? 'Suspended' : 'Active';
      }
    }
  }
});
