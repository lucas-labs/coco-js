import stringWidth from "string-width";

const emojiVariantRegex = /(?:[\uFE0F|\uFE0E])/g;

export function leftPad(str: string, length: number, padStr = ' ') {
    str = str.replace(emojiVariantRegex, '');
    const strLen = stringWidth(str);
    const padStrLen = padStr.length;

    if (!length || length <= strLen) return str;
    let padCount = Math.floor((length - strLen) / padStrLen);
    let padRemainder = (length - strLen) % padStrLen;

    return (padRemainder ? [padStr.slice(-padRemainder)] : [])
        .concat(new Array(padCount + 1).join(padStr))
        .concat(str)
        .join('');
}

export function rightPad(str: string, length: number, padStr = ' ') {
    str = str.replace(emojiVariantRegex, '');
    const strLen = stringWidth(str);
    const padStrLen = padStr.length;

    if (!length || length <= strLen) return str;
    let padCount = Math.floor((length - strLen) / padStrLen);
    let padRemainder = (length - strLen) % padStrLen;

    return [str]
        .concat(new Array(padCount + 1).join(padStr))
        .concat(padRemainder ? padStr.slice(0, padRemainder) : '')
        .join('');
}
