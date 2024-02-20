
import { getLocales } from 'expo-localization';

export const LGWord = {

    tr: {
        duacat: "Dua Kategorileri",
        duaih: "İhticaç duyduğunuz Dua'ya buradan ulaşabilirisni.",
    },
    ar: {
        duacat: "تصنيفات الدعاء!",
        duaih: "يمكنك الوصول إلى الدعاء الذي تحتاجه من هنا."
    }



};


var lcl = getLocales();
export const DeviceLanguage = lcl[0].languageCode

export const LangApp = (lang = "", word = "") => {

    var lcl = getLocales();

    var ln = lcl[0].languageCode

    // When a value is missing from a language it'll fallback to another language with the key present.
    var sas = LGWord[ln][word]

    return sas + ""
}
