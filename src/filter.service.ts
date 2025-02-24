import micromatch from 'micromatch';
import { dirname, sep } from 'path';

export class FilterService {
  private include?: string[];
  private exclude?: string[];
  private root?: string;
  private files: string[];

  constructor({
    files,
    include,
    exclude,
    root,
  }: {
    files: string[];
    include?: string[];
    exclude?: string[];
    root?: string;
  }) {
    this.root = root?.replace(/\/+$/, '');
    this.include = include;
    this.exclude = exclude;
    this.files = files;
  }

  public filter(): string[] {
    const filtered = this.files
      .filter(this.filterByRoot)
      .filter(this.filterByHidden)
      .filter(this.filterByInclude)
      .filter(this.filterByExclude);

    return this.constructMatrix(filtered);
  }

  private filterByHidden = (entry: string): boolean => {
    return dirname(entry)
      .split(sep)
      .every(i => !i.startsWith('.'));
  };

  private filterByRoot = (entry: string): boolean => {
    const { root } = this;
    if (!root) return true;
    return entry.startsWith(root);
  };

  private filterByInclude = (entry: string): boolean => {
    if (!this.include?.length) return true;
    return micromatch.isMatch(entry, this.include);
  };

  private filterByExclude = (entry: string): boolean => {
    if (!this.exclude?.length) return true;
    return !micromatch.isMatch(entry, this.exclude);
  };

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
