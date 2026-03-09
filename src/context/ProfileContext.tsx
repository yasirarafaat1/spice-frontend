import { createContext, useContext, ReactNode } from 'react';

interface Address {
  id: number;
  FullName: string;
  phone1: string;
  phone2: string | null;
  state: string;
  city: string;
  pinCode: string;
  address: string;
  addressType: string;
  createdAt: string;
  updatedAt: string;
  user_id: string;
}

interface ProfileContextType {
  profile?: {
    email?: string;
    Addresses?: Address[];
  };
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  return (
    <ProfileContext.Provider value={{}}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}