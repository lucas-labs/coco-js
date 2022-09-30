import { Key as InkKey, useStdin } from 'ink';
import { useEffect } from 'react';

export interface Key extends InkKey {
    del: boolean;
    home: boolean;
    end: boolean;
    ins: boolean;
    f1: boolean;
    f2: boolean;
    f3: boolean;
    f4: boolean;
    f5: boolean;
    f6: boolean;
    f7: boolean;
    f8: boolean;
    f9: boolean;
    f10: boolean;
    f11: boolean;
    f12: boolean;
    previous: boolean;
    next: boolean;
    space: boolean;
    alt: boolean;
}

type Handler = (input: string, key: Key) => void;

interface Options {
    /**
     * Enable or disable capturing of user input.
     * Useful when there are multiple useInput hooks used at once to avoid handling the same input several times.
     *
     * @default true
     */
    isActive?: boolean;
}

const ESCAPES = ['\u001B', '\u009B'];
// escapes regex
const ESCAPE_REGEX = new RegExp(`^(${ESCAPES.join('|')})`);

export const useInput = (inputHandler: Handler, options: Options = {}) => {
    const { stdin, setRawMode, internal_exitOnCtrlC } = useStdin();

    useEffect(() => {
        if (options.isActive === false) {
            return;
        }

        setRawMode(true);

        return () => {
            setRawMode(false);
        };
    }, [options.isActive, setRawMode]);

    useEffect(() => {
        if (options.isActive === false) {
            return;
        }

        const handleData = (data: Buffer) => {
            let input = String(data);
            const hasEscapes = ESCAPE_REGEX.test(input);
            // "\u001b[1;5C"
            // "\u001b[1;5D"
            const key: Key = {
                upArrow: input === '\u001B[A',
                downArrow: input === '\u001B[B',
                leftArrow: input === '\u001B[D',
                rightArrow: input === '\u001B[C',
                pageDown: input === '\u001B[6~',
                pageUp: input === '\u001B[5~',
                return: input === '\r',
                escape: input === '\u001B',
                del: input === '\u001b[3~',
                home: input === '\u001b[1~',
                end: input === '\u001b[4~',
                ins: input === '\u001b[2~',
                f1: input === '\u001b[[A',
                f2: input === '\u001b[[B',
                f3: input === '\u001b[[C',
                f4: input === '\u001b[[D',
                f5: input === '\u001b[[E',
                f6: input === '\u001b[17~',
                f7: input === '\u001b[18~',
                f8: input === '\u001b[19~',
                f9: input === '\u001b[20~',
                f10: input === '\u001b[21~',
                f11: input === '\u001b[23~',
                f12: input === '\u001b[24~',
                ctrl: false,
                shift: false,
                alt: false,
                tab: input === '\t' || input === '\u001B[Z',
                backspace: input === '\u0008',
                delete: input === '\u007F' || input === '\u001B[3~',
                meta: hasEscapes,
                previous: input === '\u001b[1;5D',
                next: input === '\u001b[1;5C',
                space: input === ' ',
            };

            // Copied from `keypress` module
            if (input <= '\u001A' && !key.return) {
                if (input === '\n') {
                    input = '[24~c';
                } else {
                    input = String.fromCharCode(
                        input.charCodeAt(0) + 'a'.charCodeAt(0) - 1
                    );
                }

                key.ctrl = true;
            }

            // shift + enter
            if (input === '[24~c') {
                input = '\r';
                key.return = true;
                key.shift = true;
                key.meta = true;
            }

            // shift + alt
            if (input === '\u001b\r') {
                input = '\r';
                key.return = true;
                key.meta = true;
                key.alt = true;
            }

            const isLatinUppercase = input >= 'A' && input <= 'Z';
            const isCyrillicUppercase = input >= 'А' && input <= 'Я';
            if (input.length === 1 && (isLatinUppercase || isCyrillicUppercase)) {
                key.shift = true;
            }

            // Shift+Tab
            if (key.tab && input === '[Z') {
                key.shift = true;
            }

            if (key.tab || key.backspace || key.delete) {
                input = '';
            }

            // If app is not supposed to exit on Ctrl+C, then let input listener handle it
            if (!(input === 'c' && key.ctrl) || !internal_exitOnCtrlC) {
                inputHandler(input, key);
            }
        };

        stdin?.on('data', handleData);

        return () => {
            stdin?.off('data', handleData);
        };
    }, [options.isActive, stdin, internal_exitOnCtrlC, inputHandler]);
};
