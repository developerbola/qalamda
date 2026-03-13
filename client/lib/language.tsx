"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "uz" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    tags: "Tags",
    write: "Write",
    search: "Search articles, tags, authors...",
    signIn: "Sign In",
    getStarted: "Get Started",
    profile: "Profile",
    bookmarks: "Bookmarks",
    settings: "Settings",
    signOut: "Sign Out",
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    sepia: "Sepia",
    slate: "Slate",
    heroTitle: "Read, learn, share!",
    heroDescription:
      "A new opportunity to read articles and share your knowledge with others.",
    startReading: "Start Reading",
  },
  uz: {
    tags: "Teglar",
    write: "Yozish",
    search: "Maqolalar, teglar, mualliflar...",
    signIn: "Kirish",
    getStarted: "Boshlash",
    profile: "Profil",
    bookmarks: "Foydali",
    settings: "Sozlamalar",
    signOut: "Chiqish",
    theme: "Mavzu",
    language: "Til",
    light: "Yorug'",
    dark: "To'q",
    sepia: "Sepiya",
    slate: "Slate",
    heroTitle: "O'qing, o'rganing, ulashing!",
    heroDescription:
      "Maqolalar o'qish va bilimlaringizni boshqalar bilan ulashish uchun yangi imkoniyat.",
    startReading: "O'qishni boshlash",
  },
  ru: {
    tags: "Теги",
    write: "Написать",
    search: "Поиск статей...",
    signIn: "Войти",
    getStarted: "Начать",
    profile: "Профиль",
    bookmarks: "Закладки",
    settings: "Настройки",
    signOut: "Выйти",
    theme: "Тема",
    language: "Язык",
    light: "Светлая",
    dark: "Темная",
    sepia: "Сепия",
    slate: "Грифельная",
    heroTitle: "Читайте, учитесь, делитесь!",
    heroDescription:
      "Новая возможность читать статьи и делиться знаниями с другими.",
    startReading: "Начать чтение",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("qalamda-lang") as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("qalamda-lang", lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
