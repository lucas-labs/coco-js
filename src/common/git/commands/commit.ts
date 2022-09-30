import { execute } from '../executer';

export interface CommitResult {
    hash?: string;
    branch?: string;
    message?: string;
    filesChanged?: number;
    insertions?: number;
    deletions?: number;
    status: 'ok' | 'err';
}

export async function commit(repo: string, message: string): Promise<CommitResult> {
    if (!message) throw new Error('message is required');
    const { code, out } = await execute(repo, ['commit', '-m', `${message}`]);

    if (code !== 0) return { status: 'err' };
    if (!out) return { status: 'err' };

    const lines = out.split('\n');
    const result: CommitResult = { status: 'err' };
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('[')) {
            const regex = /\[(.*)\s(.*)\]/;
            const matches = trimmed.match(regex);
            if (matches && matches.length === 3) {
                result.hash = matches[2];
                result.branch = matches[1];
            }
            result.status = 'ok';
        } else if (trimmed.substring(0, 1).match(/^\d+/)) {
            const parts = trimmed.split(',');
            result.filesChanged = parseInt(parts[0].trim().split(' ')[0]);
            if (parts[1]) {
                result.insertions = parseInt(parts[1].trim().split(' ')[0]);
            }
            if (parts[2]) {
                result.deletions = parseInt(parts[2].trim().split(' ')[0]);
            }
        }
    }

    return result;
}
