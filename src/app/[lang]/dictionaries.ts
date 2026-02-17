import "server-only";

const dictionaries = {
    en: () => import("@/dictionaries/en.json").then((module) => module.default),
    da: () => import("@/dictionaries/da.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

const getDictionaryKey = (locale: string): Locale => {
    const shortLocale = locale.split("-")[0] as Locale;
    return dictionaries[shortLocale] ? shortLocale : "da"; 
};

export const getDictionary = async (locale: string) => {
    const key = getDictionaryKey(locale);
    const loadDictionary = dictionaries[key];

    if (!loadDictionary) {
        throw new Error(`No dictionary found for locale: ${locale}`);
    }
    return await loadDictionary();  
};

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;