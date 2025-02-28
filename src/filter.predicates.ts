import micromatch from 'micromatch';
import { dirname, sep } from 'path';
import { BaseFilterConfig } from './filter.types';

export const filterByHidden =
  (config: BaseFilterConfig) =>
  (entry: string): boolean => {
    return dirname(entry)
      .split(sep)
      .every(i => !i.startsWith('.'));
  };

export const filterByRoot =
  (config: BaseFilterConfig) =>
  (entry: string): boolean => {
    const { root } = config;
    if (!root) return true;
    return entry.startsWith(root);
  };

export const filterByInclude =
  (config: BaseFilterConfig) =>
  (entry: string): boolean => {
    if (!config.include?.length) return true;
    return micromatch.isMatch(entry, config.include);
  };

export const filterByExclude =
  (config: BaseFilterConfig) =>
  (entry: string): boolean => {
    if (!config.exclude?.length) return true;
    return !micromatch.isMatch(entry, config.exclude);
  };
