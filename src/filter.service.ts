import { dirname, sep } from 'path';
import { FilterConfig, FilterPredicateCreator } from './filter.types';
import {
  filterRootFiles,
  filterByExclude,
  filterByInclude,
  filterByRoot,
} from './filter.predicates';

export class FilterService {
  private root?: string;
  private include?: string[];
  private exclude?: string[];
  private filterPredicateCreators: FilterPredicateCreator[];

  constructor({
    include,
    exclude,
    root,
    filterPredicateCreators = [
      filterRootFiles,
      filterByRoot,
      filterByInclude,
      filterByExclude,
    ],
  }: FilterConfig) {
    this.root = root?.replace(/\/+$/, '');
    this.include = include;
    this.exclude = exclude;
    this.filterPredicateCreators = filterPredicateCreators;
  }

  public filter(files: string[]): string[] {
    const config = {
      root: this.root,
      include: this.include,
      exclude: this.exclude,
    };
    const filtered = this.filterPredicateCreators.reduce(
      (currentFiles, creator) => currentFiles.filter(creator(config)),
      files,
    );

    return this.constructMatrix(filtered);
  }

  private constructMatrix(files: string[]): string[] {
    const entries = files
      .map(entry => {
        if (!this.root) {
          return dirname(entry).split(sep).at(0) ?? '';
        }
        const directories = dirname(entry).split(sep);
        if (directories.length === 1) return '';
        return directories.slice(0, this.root.split(sep).length + 1).join(sep);
      })
      .filter(Boolean);

    return [...new Set(entries)];
  }
}
