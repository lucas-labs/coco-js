/*
Borrowed from os-locale package, since it being ESM only was a lot of trouble
to use in a commonjs environment. TODO: Remove this when moving to ESM.

Source: https://github.com/sindresorhus/os-locale

MIT License
Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import lcid from 'lcid';
import childProcess from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(childProcess.execFile);

export async function exec(command: string, arguments_?: string[]) {
    const subprocess = await execFile(command, arguments_, { encoding: 'utf8' });
    subprocess.stdout = subprocess.stdout.trim();
    return subprocess;
}

export function execSync(command: string, arguments_?: string[]) {
    return (
        childProcess.execFileSync(command, arguments_, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }) as string
    ).trim();
}

const defaultOptions = { spawn: true };
const defaultLocale = 'en-US';

async function getStdOut(command: string, args?: string[]) {
    return (await exec(command, args)).stdout;
}

function getStdOutSync(command: string, args?: string[]) {
    return execSync(command, args);
}

function getEnvLocale(env = process.env) {
    return env['LC_ALL'] || env['LC_MESSAGES'] || env['LANG'] || env['LANGUAGE'];
}

function parseLocale(str: string) {
    const env: any = {};
    for (const definition of str.split('\n')) {
        const [key, value] = definition.split('=') as [string, string];
        env[key] = value?.replace(/^"|"$/g, '');
    }

    return getEnvLocale(env);
}

function getLocale(str?: string) {
    return str && str.replace(/[.:].*/, '');
}

async function getLocales() {
    return getStdOut('locale', ['-a']);
}

function getLocalesSync() {
    return getStdOutSync('locale', ['-a']);
}

function getSupportedLocale(locale: string, locales = '') {
    return locales.includes(locale) ? locale : defaultLocale;
}

async function getAppleLocale() {
    const results = await Promise.all([
        getStdOut('defaults', ['read', '-globalDomain', 'AppleLocale']),
        getLocales(),
    ]);

    return getSupportedLocale(results[0], results[1]);
}

function getAppleLocaleSync() {
    return getSupportedLocale(
        getStdOutSync('defaults', ['read', '-globalDomain', 'AppleLocale']),
        getLocalesSync()
    );
}

async function getUnixLocale() {
    return getLocale(parseLocale(await getStdOut('locale'))!);
}

function getUnixLocaleSync() {
    return getLocale(parseLocale(getStdOutSync('locale'))!);
}

async function getWinLocale() {
    const stdout = await getStdOut('wmic', ['os', 'get', 'locale']);
    const lcidCode = Number.parseInt(stdout.replace('Locale', ''), 16);

    return lcid.from(lcidCode);
}

function getWinLocaleSync() {
    const stdout = getStdOutSync('wmic', ['os', 'get', 'locale']);
    const lcidCode = Number.parseInt(stdout.replace('Locale', ''), 16);

    return lcid.from(lcidCode);
}

function normalize(input: string) {
    return input.replace(/_.*$/, '');
}

const cache = new Map();

export async function osLocale(options = defaultOptions) {
    if (cache.has(options.spawn)) {
        return cache.get(options.spawn);
    }

    let locale;

    try {
        const envLocale = getEnvLocale();

        if (envLocale || options.spawn === false) {
            locale = getLocale(envLocale);
        } else if (process.platform === 'win32') {
            locale = await getWinLocale();
        } else if (process.platform === 'darwin') {
            locale = await getAppleLocale();
        } else {
            locale = await getUnixLocale();
        }
    } catch {}

    const normalised = normalize(locale || defaultLocale);
    cache.set(options.spawn, normalised);
    return normalised;
}

export function osLocaleSync(options = defaultOptions) {
    if (cache.has(options.spawn)) {
        return cache.get(options.spawn);
    }

    let locale;
    try {
        const envLocale = getEnvLocale();

        if (envLocale || options.spawn === false) {
            locale = getLocale(envLocale);
        } else if (process.platform === 'win32') {
            locale = getWinLocaleSync();
        } else if (process.platform === 'darwin') {
            locale = getAppleLocaleSync();
        } else {
            locale = getUnixLocaleSync();
        }
    } catch {}

    const normalized = normalize(locale || defaultLocale);
    cache.set(options.spawn, normalized);
    return normalized;
}
