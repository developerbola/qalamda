"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "uz" | "uzc" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
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
      "Maqolalar o'qish va bilimlaringizni boshqalar bilan ulashish uchun yangi imконiyat.",
    startReading: "O'qishni boshlash",
    latestStories: "So'nggi hikoyalar",
    discoverStories: "Butun dunyo bo'ylab yozuvchilarning hikoyalarini kashf eting.",
    readMore: "Batafsil",
    backToHome: "Bosh sahifaga qaytish",
    articleNotFound: "Maqola topilmadi",
    noArticlesFound: "Maqolalar topilmadi.",
    page: "Sahifa",
    of: "dan",
    previous: "Oldingi",
    next: "Keyingi",
    comments: "Sharhlar",
    noCommentsYet: "Hozircha sharhlar yo'q. Birinchi bo'lib sharh qoldiring!",
    postComment: "Sharh qoldirish",
    posting: "Yuborilmoqda...",
    reply: "Javob berish",
    delete: "O'chirish",
    writeStory: "Hikoya yozish",
    title: "Sarlavha",
    excerpt: "Qisqacha mazmun (ixtiyoriy)",
    coverImageUrl: "Muqova rasm URL",
    content: "Kontent (Markdown qo'llab-quvvatlanadi)",
    saveDraft: "Qoralama saqlash",
    saving: "Saqlanmoqda...",
    publish: "Nashr qilish",
    publishing: "Nashr qilinmoqda...",
    errorPublishing: "Maqolani nashr qilishda xatolik!",
    followers: "Obunachilar",
    following: "Obuna bo'lingan",
    follow: "Obuna bo'lish",
    editProfile: "Profilni tahrirlash",
    articles: "Maqolalar",
    userNotFound: "Foydalanuvchi topilmadi",
    noArticles: "Hozircha maqolalar yo'q.",
    noBookmarks: "Hozircha saqlanganlar yo'q.",
    writeFirst: "Birinchi maqolangizni yozing",
    bookmarksDesc: "Keyinroq o'qish uchun saqlagan maqolalaringiz.",
    settingsDesc: "Profil ma'lumotlarini tahrirlash.",
    profileUpdated: "Profil muvaffaqiyatli yangilandi!",
    avatarUrl: "Avatar URL",
    fullName: "To'liq ism",
    bio: "Tarjimai hol",
    emailNoChange: "Email (o'zgartirib bo'lmaydi)",
    usernameLabel: "Foydalanuvchi nomi",
    saveChanges: "O'zgarishlarni saqlash",
    tagsDesc: "Mavzular bo'yicha maqolalarni kashf eting.",
    noTags: "Hozircha teglar yo'q.",
    published: "Nashr qilingan",
    draft: "Qoralama",
    publishedDesc: "Hikoyangizni hamma ko'ra oladi",
    draftDesc: "Ushbu qoralamani faqat o'zingiz ko'ra olasiz",
    home: "Bosh sahifa",
    library: "Kutubxona",
    stats: "Statistika",
    findWriters: "Obuna bo'lish uchun yozuvchilarni toping.",
    seeSuggestions: "Tavsiyalarni ko'rish",
  },
  uzc: {
    tags: "Теглар",
    write: "Ёзиш",
    search: "Мақолалар, теглар, муаллифлар...",
    signIn: "Кириш",
    getStarted: "Бошлаш",
    profile: "Профил",
    bookmarks: "Фойдали",
    settings: "Созламалар",
    signOut: "Чиқиш",
    theme: "Мавзу",
    language: "Тил",
    light: "Ёруғ",
    dark: "Тўқ",
    sepia: "Сепия",
    slate: "Slate",
    heroTitle: "Ўқинг, ўрганинг, улашинг!",
    heroDescription:
      "Мақолалар ўқиш va билимларингизни бошқалар билан улашиш учун янги имконият.",
    startReading: "Ўқишни бошлаш",
    latestStories: "Сўнгги ҳикоялар",
    discoverStories: "Бутун дунё бўйлаб ёзувчиларнинг ҳикояларини кашф этинг.",
    readMore: "Батафсил",
    backToHome: "Бош саҳифага қайтиш",
    articleNotFound: "Мақола топилмади",
    noArticlesFound: "Мақолалар топилмади.",
    page: "Саҳифа",
    of: "дан",
    previous: "Олдинги",
    next: "Кейинги",
    comments: "Шарҳлар",
    noCommentsYet: "Ҳозирча шарҳлар йўқ. Биринчи бўлиб шарҳ қолдиринг!",
    postComment: "Шарҳ қолдириш",
    posting: "Юборилмоқда...",
    reply: "Жавоб бериш",
    delete: "Ўчириш",
    writeStory: "Ҳикоя ёзиш",
    title: "Сарлавҳа",
    excerpt: "Қисқача мазмун (ихтиёрий)",
    coverImageUrl: "Муқова расм URL",
    content: "Контент (Markdown қўллаб-қувватланади)",
    saveDraft: "Қоралама сақлаш",
    saving: "Сақланмоқда...",
    publish: "Нашр қилиш",
    publishing: "Нашр қилинмоқда...",
    errorPublishing: "Мақолани нашр қилишда хатолик!",
    followers: "Обуначилар",
    following: "Обуна булинган",
    follow: "Обуна бўлиш",
    editProfile: "Профилни таҳрирлаш",
    articles: "Мақолалар",
    userNotFound: "Фойдаланувчи топилмади",
    noArticles: "Ҳозирча мақолалар йўқ.",
    noBookmarks: "Ҳозирча сақланганлар йўқ.",
    writeFirst: "Биринчи мақолангизни ёзинг",
    bookmarksDesc: "Кейинроқ ўқиш учун сақлаган мақолаларингиз.",
    settingsDesc: "Профил маълумотларини таҳрирлаш.",
    profileUpdated: "Профил муваффақиятли янгиланди!",
    avatarUrl: "Аватар URL",
    fullName: "Тўлиқ исм",
    bio: "Таржимаи ҳол",
    emailNoChange: "Емаил (ўзгартириб бўлмайди)",
    usernameLabel: "Фойдаланувчи номи",
    saveChanges: "Ўзгаришларни сақлаш",
    tagsDesc: "Мавзулар бўйича мақолаларни кашф этинг.",
    noTags: "Ҳозирча теглар йўқ.",
    published: "Нашр қилинган",
    draft: "Қоралама",
    publishedDesc: "Ҳикоянгизни ҳамма кўра олади",
    draftDesc: "Ушбу қораламани фақат ўзингиз кўра оласиз",
    home: "Бош саҳифа",
    library: "Кутубхона",
    stats: "Статистика",
    findWriters: "Обуна бўлиш учун ёзувчиларни топинг.",
    seeSuggestions: "Тавсияларни кўриш",
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
    latestStories: "Последние истории",
    discoverStories: "Откройте для себя истории писателей со всего мира.",
    readMore: "Читать далее",
    backToHome: "Вернуться на главную",
    articleNotFound: "Статья не найдена",
    noArticlesFound: "Статьи не найдены.",
    page: "Страница",
    of: "из",
    previous: "Предыдущая",
    next: "Следующая",
    comments: "Комментарии",
    noCommentsYet: "Комментариев пока нет. Станьте первым, кто оставит отзыв!",
    postComment: "Оставить комментарий",
    posting: "Отправка...",
    reply: "Ответить",
    delete: "Удалить",
    writeStory: "Написать историю",
    title: "Заголовок",
    excerpt: "Краткое описание (необязательно)",
    coverImageUrl: "URL обложки",
    content: "Контент (поддерживается Markdown)",
    saveDraft: "Сохранить черновик",
    saving: "Сохранение...",
    publish: "Опубликовать",
    publishing: "Публикация...",
    errorPublishing: "Ошибка при публикации статьи!",
    followers: "Подписчики",
    following: "Подписки",
    follow: "Подписаться",
    editProfile: "Редактировать профиль",
    articles: "Статьи",
    userNotFound: "Пользователь не найден",
    noArticles: "Статей пока нет.",
    noBookmarks: "Закладок пока нет.",
    writeFirst: "Напишите свою первую статью",
    bookmarksDesc: "Статьи, которые вы сохранили на потом.",
    settingsDesc: "Обновите информацию вашего профиля.",
    profileUpdated: "Профиль успешно обновлен!",
    avatarUrl: "URL аватара",
    fullName: "Полное имя",
    bio: "О себе",
    emailNoChange: "Email (нельзя изменить)",
    usernameLabel: "Имя пользователя",
    saveChanges: "Сохранить изменения",
    tagsDesc: "Исследуйте контент по темам.",
    noTags: "Теги пока отсутствуют.",
    published: "Опубликовано",
    draft: "Черновик",
    publishedDesc: "Ваша история будет видна всем",
    draftDesc: "Только вы можете видеть этот черновик",
    home: "Главная",
    library: "Библиотека",
    stats: "Статистика",
    findWriters: "Найдите авторов, на которых стоит подписаться.",
    seeSuggestions: "Посмотреть предложения",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("uz");

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
