// contexts/ContentContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import api from "@/lib/api";

interface AllContent {
  hero: any;
  about: any;
  services: any;
  history: any;
  prototypes: any;
  all_prototypes: any;
  team: any;
  full_team: any;
  aboutpg: any;
}

interface ContentContextType {
  content: AllContent;
  loading: boolean;
  error: string | null;
  refreshContent: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<AllContent>({
    hero: null,
    about: null,
    services: null,
    history: null,
    prototypes: null,
    all_prototypes: [],
    team: null,
    full_team: null,
    aboutpg: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... imports

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Define all content files to fetch with their API params
      const contentFiles = [
        { key: "hero", category: "home", file: "hero.json" },
        { key: "about", category: "home", file: "about.json" },
        { key: "services", category: "home", file: "services.json" },
        { key: "history", category: "home", file: "history.json" },
        { key: "prototypes", category: "home", file: "prototypes.json" },
        { key: "all_prototypes", category: "prototype", file: "main.json" },
        { key: "team", category: "home", file: "team.json" },
        { key: "full_team", category: "about", file: "full_team.json" },
        { key: "aboutpg", category: "about", file: "main.json" },
      ];

      // Fetch all content files in parallel
      const fetchPromises = contentFiles.map(async ({ key, category, file }) => {
        try {
          const response = await api.get(`/content/read/`, {
            params: { category, file }
          });
          return { key, data: response.data.content };
        } catch (err) {
          console.error(`Error loading ${key}:`, err);
          return { key, data: null, error: err };
        }
      });

      const results = await Promise.all(fetchPromises);

      // Combine all results into single content object
      const newContent: AllContent = { ...content };
      let hasErrors = false;

      results.forEach(({ key, data, error }) => {
        if (error) {
          hasErrors = true;
          console.error(`Failed to load ${key}:`, error);
        } else {
          newContent[key as keyof AllContent] = data;
        }
      });

      setContent(newContent);

      if (hasErrors) {
        setError(
          "Some content failed to load. Please check console for details."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unknown error loading content"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const refreshContent = () => {
    fetchContent();
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        loading,
        error,
        refreshContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
