import { spawn, SpawnOptions } from 'child_process';

export type Argv = ReadonlyArray<string>;
export type ExecOptions = SpawnOptions;
export type Result = { code: number; out: string };

export class ExecutionError extends Error {
    constructor(
        public readonly status: number,
        public readonly signal: string,
        public override readonly cause: Error
    ) {
        super(`Status code is ${status}, signal is ${signal}`);
    }
}

export async function exec(
    command: string,
    args: Argv,
    options: ExecOptions = {},
    outCb?: (out: string) => void
): Promise<Result> {
    return new Promise<Result>(function (resolve, reject) {
        let out = '';
        const process = spawn(command, Array.from(args), { ...options });
        process.on('error', (err) =>
            reject(new ExecutionError(process.exitCode, process.signalCode, err))
        );
        process.on('close', (code) => resolve({ code, out }));
        process.on('signal', (signal) =>
            reject(new Error(`[${command}] process was killed with signal ${signal}`))
        );
        process.stdout.setEncoding('utf8');
        process.stderr.setEncoding('utf8');
        process.stdout.on('data', (data: string) => {
            if (!data) return;
            outCb && outCb(data);
            out += data.toString();
        });
        process.stderr.on('data', (data: string) => {
            if (!data) return;
            if (data.toString().toLowerCase().startsWith('debugger attached')) return;
            if (
                data
                    .toString()
                    .toLowerCase()
                    .startsWith('waiting for the debugger to disconnect')
            )
                return;

            outCb && outCb(data);
            out += data.toString();
        });
    });
}

export function getCommandFailedError(
    code: number,
    repo: string,
    command: string[],
    out: string
): Error {
    return new Error(
        `Git command failed with code ${code}, repo: ${repo}, command: git ${command.join(
            ' '
        )}, out: '${out}'`
    );
}

export async function execute(repo: string, args: Argv, options: ExecOptions = {}) {
    return exec('git', args, { ...options, cwd: repo });
}
