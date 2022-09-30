import { osLocaleSync } from './locale';
import en from './locales/en.json';

let dictionary: typeof en;

export async function LoadDictonary() {
    if (dictionary) return;
    const locale = osLocaleSync();

    return import(`./locales/${locale}.json`)
        .then((module) => {
            dictionary = Object.assign({}, en, module.default);
        })
        .catch(() => {
            dictionary = en;
        });
}

export function i18n(key: TemplateStringsArray): string;
export function i18n(key: string, placeholders?: { [placeholder: string]: string }): string;
export function i18n(key: keyof typeof en, placeholders?: { [placeholder: string]: string }): string;
export function i18n(
    key: keyof typeof en | string | TemplateStringsArray,
    placeholders: { [placeholder: string]: string } = {}
) {
    if (!dictionary) {
        return key;
    }

    const value = dictionary[key as keyof typeof en];
    if (!value) return key;

    return value.replace(
        /<%=(.*?)%>/g,
        (_, placeholder: string) => placeholders[placeholder] || ''
    );
}
