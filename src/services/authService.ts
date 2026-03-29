import { convex } from './convex';
import { api } from '../../convex/_generated/api';

const USER_STORAGE_KEY = 'rimtransport_user_id';

export const authService = {
  async signUp(email: string | undefined, password: string, name: string, phone: string, role: 'driver' | 'passenger') {
    const mockUserId = "user_" + Math.random().toString(36).substring(7);
    
    const convexId = await (convex as any).mutation(api.profiles.createProfile, {
      userId: mockUserId,
      name,
      email,
      password,
      phone,
      role,
    });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, convexId);
    }
    return { user: { id: convexId, phone, email } };
  },

  async signIn(phone: string, password: string) {
    const user = await convex.query(api.profiles.login, { phone, password });
    
    if (!user) {
      throw new Error("Invalid phone or password");
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, user.id);
    }
    return { user: { id: user.id, phone: user.phone, email: user.email } };
  },

  async getProfile(id: any) {
    return await convex.query(api.profiles.getProfileById, { id });
  },

  async updateProfile(
    id: any,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      role?: 'driver' | 'passenger';
    }
  ) {
    return await (convex as any).mutation(api.profiles.updateProfile, {
      id,
      ...data,
    });
  },

  async generateProfilePhotoUploadUrl() {
    return await (convex as any).mutation(api.profiles.generateProfilePhotoUploadUrl, {});
  },

  async setProfilePhoto(id: any, storageId: string) {
    return await (convex as any).mutation(api.profiles.setProfilePhoto, {
      id,
      storageId,
    });
  },

  async changePassword(id: any, oldPassword: string, newPassword: string) {
    return await (convex as any).mutation(api.profiles.changePassword, {
      id,
      oldPassword,
      newPassword,
    });
  },

  async signOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  async getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const convexId = localStorage.getItem(USER_STORAGE_KEY);
    if (!convexId) return null;
    
    if (convexId.startsWith('user_')) {
      await this.signOut();
      return null;
    }

    try {
      const profile = await this.getProfile(convexId as any);
      if (profile) {
        return { id: convexId, phone: profile.phone, email: profile.email };
      }
      return null;
    } catch (e) {
      console.error("Session error:", e);
      await this.signOut();
      return null;
    }
  }
};
