import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

import pt from "../constants/translations/pt.json";
import es from "../constants/translations/es.json";

const i18n = new I18n({
  pt,
  es,
});

i18n.locale = Localization.getLocales()[0]?.languageCode || "pt";
i18n.enableFallback = true;
i18n.defaultLocale = "pt";

export default i18n;
