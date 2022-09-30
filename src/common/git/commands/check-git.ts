import { execute } from '../executer';

/** Checks if repo is a path to a git repository */
export async function checkGit(repo: string): Promise<boolean> {
    const command = ['rev-parse', '--is-inside-work-tree'];
    const { code, out } = await execute(repo, command);

    if (code !== 0) return false;

    return out?.trim() === 'true';
}
