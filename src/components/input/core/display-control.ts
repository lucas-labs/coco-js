import c from 'chalk';
import stringWidth from 'string-width';
import { rightPad } from '../../../common/utils/pad';

export function createLines(
    raw: string,
    columns: number,
    focused: boolean,
    bg: string,
    fg: string,
    cursor?: number,
    marginCount = 0
) {
    const lines = raw.split('\n');
    const margin = ' '.repeat(marginCount);

    const formattedLines = lines.map((line, index) => {
        if (cursor !== undefined && cursor >= 0) {
            const lineWithCursor = getRelativePosition(raw, cursor);

            if (index === lineWithCursor.line && focused) {
                const before = line.slice(0, lineWithCursor.position);
                const after = line.slice(lineWithCursor.position + 1);
                const newLine = `${before}${c.inverse.dim(line[lineWithCursor.position] || ' ')}${after}`;
                
                return c.bgHex(bg).hex(fg)(
                    rightPad(margin + newLine, columns)
                );
            }
        }

        return c.bgHex(bg).hex(fg)(
            rightPad(margin + line, columns)
        );
    });

    return formattedLines;
}

function getRelativePosition(raw: string, i: number) {
    const lines = raw.split('\n');
    let cursor = 0;
    for (let line = 0; line < lines.length; line++) {
        const l = lines[line]!;
        if (cursor + l.length >= i) {
            return {
                line,
                position: i - cursor,
            };
        }
        cursor += l.length + 1;
    }
    return {
        line: lines.length - 1,
        position: (lines[lines.length - 1] || '').length,
    };
}
