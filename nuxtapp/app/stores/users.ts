import { defineStore } from 'pinia';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Store Admin' | 'Branch Manager' | 'POS Cashier' | string;
  status: 'Active' | 'Suspended' | string;
  lastActive: string;
  terminalAccess: boolean;
  branch_id?: number | null;
  branch_name?: string | null;
  branch_code?: string | null;
}

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    isLoading: false,
    error: null as string | null,
    planMeta: {
      planName: 'Starter',
      maxUsers: 2,
      totalStaff: 0,
      canAddStaff: true,
      remainingSlots: 2
    }
  }),
  actions: {
    async fetchUsers(branchId?: number | 'all') {
      this.isLoading = true;
      this.error = null;
      try {
        const url = branchId && branchId !== 'all' ? `/auth/staff?branch_id=${branchId}` : '/auth/staff';
        const res = await axios.get(url);
        const staffArray = Array.isArray(res.data?.staff) ? res.data.staff : Array.isArray(res.data?.data) ? res.data.data : [];
        if (res.data && res.data.success && staffArray.length >= 0) {
          this.users = staffArray.map((u: any) => {
            const rawRole = (u.role || '').toString().toUpperCase().replace(/[_\s-]+/g, '');
            const displayRole = rawRole === 'STOREADMIN' || rawRole === 'TENANTOWNER' ? 'Store Admin' :
              rawRole === 'BRANCHMANAGER' || rawRole === 'MANAGER' ? 'Branch Manager' : 'POS Cashier';
            return {
              id: String(u.id),
              name: u.name,
              email: u.email,
              role: displayRole,
              status: u.status === 'suspended' ? 'Suspended' : 'Active',
              lastActive: u.last_active || (u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Never'),
              terminalAccess: displayRole === 'POS Cashier' || displayRole === 'Store Admin' || displayRole === 'Branch Manager',
              branch_id: u.branch_id ? Number(u.branch_id) : null,
              branch_name: u.branch_name || null,
              branch_code: u.branch_code || null
            };
          });


          if (res.data.meta) {
            this.planMeta = {
              planName: res.data.meta.planName || 'Starter',
              maxUsers: Number(res.data.meta.maxUsers || 2),
              totalStaff: this.users.length,
              canAddStaff: Boolean(res.data.meta.canAddStaff),
              remainingSlots: Number(res.data.meta.remainingSlots ?? Math.max(0, (res.data.meta.maxUsers || 2) - this.users.length))
            };
          } else {
            this.planMeta.totalStaff = this.users.length;
            this.planMeta.canAddStaff = this.users.length < this.planMeta.maxUsers;
            this.planMeta.remainingSlots = Math.max(0, this.planMeta.maxUsers - this.users.length);
          }
        } else {
          this.users = [];
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch staff from server';
        console.error('API fetch staff error:', this.error);
        this.users = [];
      } finally {
        this.isLoading = false;
      }
    },
    
    async createUser(userData: { name: string; email: string; role: string; password?: string; branch_id?: number | null }) {
      this.isLoading = true;
      try {
        const roleLower = userData.role.toLowerCase();
        const rawRole = roleLower.includes('admin') ? 'STORE_ADMIN' :
          roleLower.includes('branch') || roleLower.includes('manager') ? 'BRANCH_MANAGER' : 'CASHIER';

        const res = await axios.post('/auth/staff', {
          name: userData.name,
          email: userData.email,
          password: userData.password || '123456',
          role: rawRole,
          branch_id: userData.branch_id || null
        });

        if (res.data && res.data.success) {
          await this.fetchUsers();
          return res.data.staff;
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to create user';
        console.error('createUser error:', msg);
        throw new Error(msg);
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateUser(id: string, updates: Partial<User> & { password?: string }) {
      try {
        let rawRole = undefined;
        if (updates.role) {
          const roleLower = updates.role.toLowerCase();
          rawRole = roleLower.includes('admin') ? 'STORE_ADMIN' :
            roleLower.includes('branch') || roleLower.includes('manager') ? 'BRANCH_MANAGER' : 'CASHIER';
        }
        await axios.patch(`/auth/staff/${id}`, {
          name: updates.name,
          role: rawRole,
          status: updates.status ? updates.status.toLowerCase() : undefined,
          branch_id: updates.branch_id !== undefined ? updates.branch_id : undefined,
          password: updates.password
        });
        await this.fetchUsers();
      } catch (err: any) {
        console.error('updateUser error:', err);
      }
    },
    
    async toggleUserStatus(id: string) {
      const user = this.users.find(u => u.id === id);
      if (user) {
        const newStatus = user.status === 'Active' ? 'suspended' : 'active';
        await axios.patch(`/auth/staff/${id}`, { status: newStatus }).catch(() => {});
        user.status = user.status === 'Active' ? 'Suspended' : 'Active';
      }
    },

    async deleteUser(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`/auth/staff/${id}`);
        if (res.data && res.data.success) {
          await this.fetchUsers();
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to delete staff';
        console.error('deleteUser error:', msg);
        throw new Error(msg);
      } finally {
        this.isLoading = false;
      }
    }
  }
});
