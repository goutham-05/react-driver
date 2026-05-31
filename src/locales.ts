import type { TourConfig } from "./types";

type LocaleConfig = Pick<TourConfig, "prevBtnText" | "nextBtnText" | "doneBtnText">;

/**
 * Pre-built locale configs. Spread into `useTour` to set button labels in
 * the user's language.
 *
 * @example
 * import { locales } from "@oqlet/react-driver";
 *
 * useTour({ ...locales.fr, steps: [...] });
 */
export const locales: Record<string, LocaleConfig> = {
  en: { prevBtnText: "← Back",     nextBtnText: "Next →",      doneBtnText: "Done"      },
  fr: { prevBtnText: "← Retour",   nextBtnText: "Suivant →",   doneBtnText: "Terminer"  },
  es: { prevBtnText: "← Atrás",    nextBtnText: "Siguiente →", doneBtnText: "Finalizar" },
  de: { prevBtnText: "← Zurück",   nextBtnText: "Weiter →",    doneBtnText: "Fertig"    },
  pt: { prevBtnText: "← Anterior", nextBtnText: "Próximo →",   doneBtnText: "Concluir"  },
  it: { prevBtnText: "← Indietro", nextBtnText: "Avanti →",    doneBtnText: "Fine"      },
  nl: { prevBtnText: "← Terug",    nextBtnText: "Volgende →",  doneBtnText: "Klaar"     },
  ja: { prevBtnText: "← 戻る",     nextBtnText: "次へ →",       doneBtnText: "完了"       },
  zh: { prevBtnText: "← 上一步",   nextBtnText: "下一步 →",     doneBtnText: "完成"       },
  ko: { prevBtnText: "← 이전",     nextBtnText: "다음 →",       doneBtnText: "완료"       },
  ar: { prevBtnText: "السابق ←",   nextBtnText: "→ التالي",    doneBtnText: "إنهاء"     },
  ru: { prevBtnText: "← Назад",    nextBtnText: "Далее →",     doneBtnText: "Готово"    },
  hi: { prevBtnText: "← पिछला",    nextBtnText: "अगला →",      doneBtnText: "समाप्त"    },
};
