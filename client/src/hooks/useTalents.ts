import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Talent {
  id: string;
  user_id: string;
  title: string;
  skills: string[];
  experience_years: number | null;
  bio: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

// Base API URL
const API_BASE = '/api'; // replace with your actual backend URL if needed

export const useTalents = () => {
  return useQuery({
    queryKey: ['talents'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/talents`);
      if (!res.ok) throw new Error('Failed to fetch talents');
      const data = await res.json();
      return data as Talent[];
    },
  });
};

export const useMyTalentProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['my-talent-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const res = await fetch(`${API_BASE}/talents/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch your talent profile');
      const data = await res.json();
      return data as Talent | null;
    },
    enabled: !!userId,
  });
};

export const useCreateTalentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (talent: Omit<Talent, 'id' | 'created_at' | 'updated_at' | 'profiles'>) => {
      const res = await fetch(`${API_BASE}/talents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(talent),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talents'] });
      queryClient.invalidateQueries({ queryKey: ['my-talent-profile'] });
      toast.success('Profile created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create profile');
    },
  });
};

export const useUpdateTalentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Talent> & { id: string }) => {
      const res = await fetch(`${API_BASE}/talents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talents'] });
      queryClient.invalidateQueries({ queryKey: ['my-talent-profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
};
