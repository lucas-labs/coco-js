import { execute, getCommandFailedError } from '../executer';

export interface GitLog {
    hash: string;
    author: string;
    authorEmail: string;
    committer: string;
    committerEmail: string;
    date: string;
    subject: string;
    body: string[];
}

export async function getCommit(repo: string, hash: string): Promise<GitLog> {
    const command = [
        '--no-pager',
        'show',
        hash,
        '--no-color',
        '-s',
        `--pretty=COMMIT_INIT%n%H%n%an%n%ae%n%cn%n%ce%n%ad%n%s%n%b`,
    ];

    const { code, out } = await execute(repo, command);
    if (code !== 0) throw getCommandFailedError(code, repo, command, out);
    return parseLog(out);
}

export function parseLog(out: string): GitLog {
    const lines = out.split('\n');
    if (lines.length < 7) return;

    const body = lines.slice(8).join('\n').replace(/\n+$/, '').split('\n');
    if (body.length === 1 && body[0] === '') body.pop();

    return {
        hash: lines[1],
        author: lines[2],
        authorEmail: lines[3],
        committer: lines[4],
        committerEmail: lines[5],
        date: lines[6],
        subject: lines[7],
        body: body ?? undefined,
    };
}
