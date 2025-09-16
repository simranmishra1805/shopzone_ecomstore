import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { db } from '../lib/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize database and check for existing user
    db.init();
    const currentUser = db.users.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const newUser = await db.users.create(email, password);
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword as User);
      db.users.setCurrentUser(userWithoutPassword as User);
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const authenticatedUser = await db.users.authenticate(email, password);
      const { password: _, ...userWithoutPassword } = authenticatedUser;
      setUser(userWithoutPassword as User);
      db.users.setCurrentUser(userWithoutPassword as User);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    db.users.setCurrentUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}