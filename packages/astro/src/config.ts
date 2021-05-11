import 'source-map-support/register.js';
import type { AstroConfig } from './@types/astro';
import { join as pathJoin, resolve as pathResolve } from 'path';
import { existsSync } from 'fs';

/** Type util */
const type = (thing: any): string => (Array.isArray(thing) ? 'Array' : typeof thing);

/** Throws error if a user provided an invalid config. Manually-implemented to avoid a heavy validation library. */
function validateConfig(config: any): void {
  // basic
  if (config === undefined || config === null) throw new Error(`[astro config] Config empty!`);
  if (typeof config !== 'object') throw new Error(`[astro config] Expected object, received ${typeof config}`);

  // strings
  for (const key of ['projectRoot', 'astroRoot', 'dist', 'public', 'site']) {
    if (config[key] !== undefined && config[key] !== null && typeof config[key] !== 'string') {
      throw new Error(`[astro config] ${key}: ${JSON.stringify(config[key])}\n  Expected string, received ${type(config[key])}.`);
    }
  }

  // booleans
  for (const key of ['sitemap']) {
    if (config[key] !== undefined && config[key] !== null && typeof config[key] !== 'boolean') {
      throw new Error(`[astro config] ${key}: ${JSON.stringify(config[key])}\n  Expected boolean, received ${type(config[key])}.`);
    }
  }

  if (typeof config.devOptions?.port !== 'number') {
    throw new Error(`[astro config] devOptions.port: Expected number, received ${type(config.devOptions?.port)}`);
  }

  if (config.experimental) {
    if (typeof config.experimental !== 'object') {
      throw new Error(`[astro config] experimental: Expected object, received ${type(config.experimental)}`);
    }
    if (config.experimental.markdownOptions) {
      if (typeof config.experimental.markdownOptions !== 'object') {
        throw new Error(`[astro config] experimental: Expected object, received ${type(config.experimental)}`);
      }
      for (const key of ['footnotes', 'gfm']) {
        if (
          config.experimental.markdownOptions[key] !== undefined &&
          config.experimental.markdownOptions[key] !== null &&
          typeof config.experimental.markdownOptions[key] !== 'boolean'
        ) {
          throw new Error(
            `[astro config] exerimental.markdownOptions.${key}: ${JSON.stringify(config.experimental.markdownOptions[key])}\n  Expected boolean, received ${type(
              config.experimental.markdownOptions[key]
            )}.`
          );
        }
      }
      if (config.experimental.markdownOptions.plugins !== undefined && config.experimental.markdownOptions.plugins !== null) {
        if (!Array.isArray(config.experimental.markdownOptions.plugins)) {
          throw new Error(
            `[astro config] exerimental.markdownOptions.plugins: ${JSON.stringify(config.experimental.markdownOptions.plugins)}\n  Expected array, received ${type(
              config.experimental.markdownOptions.plugins
            )}.`
          );
        }

        for (const [key, value] of Object.entries(config.experimental.markdownOptions.plugins)) {
          if (typeof value !== 'string' && typeof value !== 'object') {
            throw new Error(`[astro config] exerimental.markdownOptions.plugins[${key}]: ${JSON.stringify(value)}\n  Expected string or object, received ${type(value)}.`);
          }
          if (value !== undefined && value !== null && typeof value === 'object') {
            const unknownPluginKeys = Object.keys(value).filter((v) => v !== 'resolve' && v !== 'options');
            if (unknownPluginKeys.length > 0) {
              const single = unknownPluginKeys.length === 1;
              throw new Error(
                `[astro config] exerimental.markdownOptions.plugins[${key}]:\n  Unknown plugin key${single ? '' : 's'} ${JSON.stringify(
                  single ? unknownPluginKeys[0] : unknownPluginKeys
                )}. Supported keys are ["resolve", "options"]`
              );
            }
          }
        }
      }
    }
  }
}

/** Set default config values */
function configDefaults(userConfig?: any): any {
  const config: any = { ...(userConfig || {}) };

  if (!config.projectRoot) config.projectRoot = '.';
  if (!config.astroRoot) config.astroRoot = './src';
  if (!config.dist) config.dist = './dist';
  if (!config.public) config.public = './public';
  if (!config.devOptions) config.devOptions = {};
  if (!config.devOptions.port) config.devOptions.port = 3000;
  if (!config.buildOptions) config.buildOptions = {};
  if (!config.experimental) config.experimental = {};
  if (!config.experimental.markdownOptions) config.experimental.markdownOptions = {};
  if (typeof config.buildOptions.sitemap === 'undefined') config.buildOptions.sitemap = true;

  return config;
}

/** Turn raw config values into normalized values */
function normalizeConfig(userConfig: any, root: string): AstroConfig {
  const config: any = { ...(userConfig || {}) };

  const fileProtocolRoot = `file://${root}/`;
  config.projectRoot = new URL(config.projectRoot + '/', fileProtocolRoot);
  config.astroRoot = new URL(config.astroRoot + '/', fileProtocolRoot);
  config.public = new URL(config.public + '/', fileProtocolRoot);

  return config as AstroConfig;
}

/** Attempt to load an `astro.config.mjs` file */
export async function loadConfig(rawRoot: string | undefined, configFileName = 'astro.config.mjs'): Promise<AstroConfig> {
  if (typeof rawRoot === 'undefined') {
    rawRoot = process.cwd();
  }

  const root = pathResolve(rawRoot);
  const astroConfigPath = pathJoin(root, configFileName);

  // load
  let config: any;
  if (existsSync(astroConfigPath)) {
    config = configDefaults((await import(astroConfigPath)).default);
  } else {
    config = configDefaults();
  }

  // validate
  validateConfig(config);

  // normalize
  config = normalizeConfig(config, root);

  return config as AstroConfig;
}
