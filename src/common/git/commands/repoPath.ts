import { execute } from '../executer';

/** Gets current repo top-level path */
export async function repoPath(repo: string): Promise<string> {
    const command = ['rev-parse', '--show-toplevel'];
    const { code, out } = await execute(repo, command);
    if (code !== 0) return undefined;
    return out?.trim();
}
