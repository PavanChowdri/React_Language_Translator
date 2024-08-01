/// <reference types="vite/client" />/

type LangType = "ja" | "hi" | "es" | "fr";
type WordType = {
  word: string;
  meaning: string;
  options: string[];
};

interface StateType {
  loading: boolean;
  result: string[];
  error?: string;
  words: WordType[];
}

type FetchDataType = {
  translations: {
    text: string;
  }[];
};
