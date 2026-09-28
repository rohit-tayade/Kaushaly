import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_GEMINI_KEY } from '@/services/gemini';

interface UserProfile {
  id: string;
  name: string;
  created_at: string;
}

interface UserContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  isLoading: boolean;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  openAIKey: string;
  setOpenAIKey: (key: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(DEFAULT_GEMINI_KEY);

  useEffect(() => {
    // Check localStorage for existing user profile and API key
    const storedProfileId = localStorage.getItem('user_profile_id');
    const storedCachedProfile = localStorage.getItem('cached_user_profile');
    const storedGeminiKey = localStorage.getItem('gemini_api_key');
    const storedOpenAiKey = localStorage.getItem('openai_api_key');

    if (storedGeminiKey) {
      setGeminiApiKeyState(storedGeminiKey);
    } else if (storedOpenAiKey && storedOpenAiKey.startsWith('AQ.')) {
      // User entered Gemini key in openai field previously
      setGeminiApiKeyState(storedOpenAiKey);
      localStorage.setItem('gemini_api_key', storedOpenAiKey);
    }

    if (storedProfileId) {
      fetchUserProfile(storedProfileId, storedCachedProfile);
    } else if (storedCachedProfile) {
      try {
        setUserProfile(JSON.parse(storedCachedProfile));
      } catch {
        // ignore JSON parse error
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (profileId: string, cachedProfileStr: string | null) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (data && !error) {
        setUserProfile(data);
        localStorage.setItem('cached_user_profile', JSON.stringify(data));
      } else if (cachedProfileStr) {
        // Fallback to locally cached profile
        setUserProfile(JSON.parse(cachedProfileStr));
      } else {
        localStorage.removeItem('user_profile_id');
      }
    } catch (error) {
      console.warn('Network error fetching remote profile, falling back to local storage:', error);
      if (cachedProfileStr) {
        try {
          setUserProfile(JSON.parse(cachedProfileStr));
        } catch {
          // ignore
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetUserProfile = (profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      localStorage.setItem('user_profile_id', profile.id);
      localStorage.setItem('cached_user_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('user_profile_id');
      localStorage.removeItem('cached_user_profile');
    }
  };

  const handleSetGeminiKey = (key: string) => {
    setGeminiApiKeyState(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      localStorage.setItem('openai_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
      localStorage.removeItem('openai_api_key');
    }
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile: handleSetUserProfile,
        isLoading,
        geminiApiKey,
        setGeminiApiKey: handleSetGeminiKey,
        openAIKey: geminiApiKey, // Alias for backwards compatibility
        setOpenAIKey: handleSetGeminiKey, // Alias for backwards compatibility
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
