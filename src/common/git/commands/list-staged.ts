import { execute } from '../executer';

export async function listStaged(repo: string): Promise<string[]> {
    const command = ['diff', '--name-only', '--cached'];
    const { code, out } = await execute(repo, command);
    if (code !== 0) return [];
    if (!out) return [];

    return out
        .trim()
        .split('\n')
        .filter((x) => x);
}
