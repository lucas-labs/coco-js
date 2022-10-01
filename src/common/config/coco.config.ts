import { Config, ConventionalCommitType } from '../types/coco.types';
import { existsSync, readFileSync } from 'fs';
import { parse } from 'yaml';

/** Loads user config file if it exists */
export function loadUserConfig(cwd = process.cwd()) {
    const cfgFileNames = ['coco.yaml', 'coco.yml', '.cocorc'];
    const configPath = cfgFileNames
        .map((name) => `${cwd}/${name}`)
        .find((name) => existsSync(name));

    if (!configPath) return {};

    return parse(readFileSync(configPath, 'utf8'));
}

/** default commit types if no types config is provided */
const defaultTypes: ConventionalCommitType[] = [
    {
        desc: 'Introduces a new feature',
        name: 'feat',
        emoji: '✨',
    },
    {
        desc: 'Fixes a bug',
        name: 'fix',
        emoji: '🚑️',
    },
    {
        desc: "Other changes that don't modify src or test files",
        name: 'chore',
        emoji: '🧹',
    },
    {
        desc: 'Documentation only changes',
        name: 'docs',
        emoji: '📝',
    },
    {
        desc: 'Code cosmetic changes (formatting, indentation, etc.)',
        name: 'style',
        emoji: '💄',
    },
    {
        desc: 'A change that refactors code without adding or removing features',
        name: 'refactor',
        emoji: '🔨',
    },
    {
        desc: 'A code change that improves performance',
        name: 'perf',
        emoji: '🐎',
    },
    {
        desc: 'A change that only adds or updates tests',
        name: 'test',
        emoji: '🧪',
    },
    {
        desc: 'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
        name: 'ci',
        emoji: '🔄',
    },
    {
        desc: 'Reverts a previous commit',
        name: 'revert',
        emoji: '🔙',
    },
    {
        desc: 'Releases a new version',
        name: 'release',
        emoji: '🔖',
    },
    {
        desc: 'Work in progress',
        name: 'wip',
        emoji: '🚧',
    },
    {
        desc: 'A change that updates or adds translations (internationalization)',
        name: 'i18n',
        emoji: '🌐',
    },
];

/**
 * ___Default `coco` configuration___
 *
 * We'll merge this config with the user
 * provided config
 */
const defaultConfig: Config = {
    types: defaultTypes,
    // TODO: accept a custom array of scopes 
    // and instead of asking the user to type 
    // the scope, present the list as it's
    // now being done with types
    scopes: [],

    // TODO: emoji/gitmoji support
    useEmoji: false,

    // TODO: add support for configuring if scope, 
    // body, footer and bc steps should be asked
    askScope: true,
    askBody: true,
    askFooter: true,
    askBreakingChange: true,
};

export function getConfig(): Config {
    const userCfg = loadUserConfig();

    const config = Object.keys(defaultConfig)
        .map((k): keyof Config => k as keyof Config)
        .reduce((acc, key) => {
            const userOverride = userCfg[key];
            if (userOverride) {
                acc[key] = userCfg[key];
            }
            return acc;
        }, defaultConfig);

    return config;
}

/** Get type by its name by searching in a list of types */
export const getCommitType = (types: ConventionalCommitType[], name: string) => {
    return types.find((type) => type.name === name);
};
