import axios from "axios";
import { generate } from "random-words";
import _ from "lodash";

const generateMCQ = (
  meaning: {
    Text: string;
  }[],
  idx: number
): string[] => {
  const correctAns: string = meaning[idx].Text;

  const allMeaningExceptForCorrect = meaning.filter(
    (i) => i.Text !== correctAns
  );
  const incorrectOptions: string[] = _.sampleSize(
    allMeaningExceptForCorrect,
    3
  ).map((i) => i.Text);

  const mcqOptions = _.shuffle([...incorrectOptions, correctAns]);
  return mcqOptions;
};

export const translateWords = async (params: LangType): Promise<WordType[]> => {
  try {
    const generatedWords = generate(8);
    if (typeof generatedWords === "string") {
      throw new Error("Generate did not return an array of strings");
    }

    const words: { Text: string }[] = generatedWords.map((word: string) => ({
      Text: word,
    }));
    const apikey = import.meta.env.VITE_MICROSOFT_TRANSLATOR;

    const response = await axios.post(
      "https://microsoft-translator-text.p.rapidapi.com/translate",
      words,
      {
        params: {
          "to[0]": params,
          "api-version": "3.0",
          profanityAction: "NoAction",
          textType: "plain",
        },
        headers: {
          "x-rapidapi-key": apikey,
          "x-rapidapi-host": "microsoft-translator-text.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }
    );

    const receive: FetchDataType[] = response.data;

    const arr: WordType[] = receive.map((i, idx) => {
      const options: string[] = generateMCQ(words, idx);
      return {
        word: i.translations[0].text,
        meaning: words[idx].Text,
        options,
      };
    });
    return arr;
  } catch (error) {
    console.log(error);
    throw new Error("some error");
  }
};

export const countMatchingElements = (
  arr1: string[],
  arr2: string[]
): number => {
  if (arr1.length !== arr2.length) throw new Error("Arrays are not equal");

  let matchedCount = 0;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] === arr2[i]) matchedCount++;
  }

  return matchedCount;
};

export const fetchAudio = async (
  text: string,
  language: LangType
): Promise<string> => {
  const key = import.meta.env.VITE_TEXT_TO_SPEECH_API;
  const rapidapikey = import.meta.env.VITE_RAPID_KEY;
  const encodedParams = new URLSearchParams({
    src: text,
    r: "0",
    c: "mp3",
    f: "8khz_8bit_mono",
    b64: "true",
  });

  if (language === "ja") encodedParams.set("hl", "ja-jp");
  else if (language === "es") encodedParams.set("hl", "es-es");
  else if (language === "fr") encodedParams.set("hl", "fr-fr");
  else encodedParams.set("hl", "hi-in");

  const { data }: { data: string } = await axios.post(
    "https://voicerss-text-to-speech.p.rapidapi.com/",
    encodedParams,
    {
      params: { key },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "x-rapidapi-key": rapidapikey,
        "x-rapidapi-host": "voicerss-text-to-speech.p.rapidapi.com",
      },
    }
  );

  return data;
};
