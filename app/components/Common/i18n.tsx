import csTrans from "~/translations/cs.json";
import daTrans from "~/translations/da.json";
import deTrans from "~/translations/de.json";
import enTrans from "~/translations/en.json";
import esTrans from "~/translations/es.json";
import fiTrans from "~/translations/fi.json";
import frTrans from "~/translations/fr.json";
import itTrans from "~/translations/it.json";
import jaTrans from "~/translations/ja.json";
import koTrans from "~/translations/ko.json";
import nbTrans from "~/translations/nb.json";
import nlTrans from "~/translations/nl.json";
import plTrans from "~/translations/pl.json";
import ptBrTrans from "~/translations/pt-BR.json";
import plPTTrans from "~/translations/pt-PT.json";
import svTrans from "~/translations/sv.json";
import thTrans from "~/translations/th.json";
import trTrans from "~/translations/tr.json";
import viTrans from "~/translations/vi.json";
import zhCNTrans from "~/translations/zh-CN.json";
import zhTWTrans from "~/translations/zh-TW.json";

import { useI18n } from "@shopify/react-i18n";

// https://www.ibm.com/docs/en/datacap/9.1.8?topic=support-supported-language-codes

// https://developers.staffbase.com/references/languages-and-locale-codes/#list-of-languages-and-locale-codes
const mLocales = getMapLocales();

export const useI18nMultiple = () => {
  return useI18n({
    id: "Beepify",
    fallback: enTrans,
    async translations(locale) {
      var current = mLocales.get(locale);
      console.log("Local input loading : ", locale, current);
      if (current) {
        return current;
      }
      var idx = locale.indexOf("-");
      if (idx) {
        return mLocales.get(locale.slice(0, idx));
      }
      return null;
    },
  });
};

function getMapLocales() {
  var locales = new Map<string, any>();
  // Czech
  locales.set("cs", csTrans);
  locales.set("cs-CZ", csTrans);

  // Denmark
  locales.set("da", daTrans);

  // German
  locales.set("de", deTrans);
  locales.set("de-DE", deTrans);

  // English
  locales.set("en", enTrans);
  locales.set("en-US", enTrans);
  locales.set("en-UK", enTrans);

  // Spanish
  locales.set("es", esTrans);
  locales.set("es-ES", esTrans);

  // Finnish
  locales.set("fi", fiTrans);
  locales.set("fi-FI", fiTrans);

  // French
  locales.set("fr", frTrans);
  locales.set("fr-FR", frTrans);

  // Italian
  locales.set("it", itTrans);
  locales.set("it-IT", itTrans);

  // Japanese
  locales.set("ja", jaTrans);
  locales.set("ja-JP", jaTrans);

  locales.set("ko", koTrans);
  locales.set("nb", nbTrans);

  // Dutch
  locales.set("nl", nlTrans);
  locales.set("nl-NL", nlTrans);

  // Polish
  locales.set("pl", plTrans);
  locales.set("pl-PL", plTrans);

  // Portuguese
  locales.set("pt", ptBrTrans);
  locales.set("pt-BR", ptBrTrans);
  locales.set("pt-T", ptBrTrans);

  // Polish
  locales.set("pl", plPTTrans);
  locales.set("pl_PL", plPTTrans);

  // Swedish
  locales.set("sv", svTrans);
  locales.set("sv-SE", svTrans);

  // Thai
  locales.set("th", thTrans);
  locales.set("th-TH", thTrans);

  // Turkish
  locales.set("tr", trTrans);
  locales.set("tr-TR", trTrans);

  // VN
  locales.set("vi", viTrans);
  locales.set("vi-VN", viTrans);

  // China
  locales.set("zh", zhCNTrans);
  locales.set("zh-CN", zhCNTrans);
  locales.set("zh-TW", zhTWTrans);
  return locales;
}
