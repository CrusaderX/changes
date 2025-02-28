export interface BaseFilterConfig {
  root?: string;
  include?: string[];
  exclude?: string[];
}

export type FilterPredicateCreator = (
  config: BaseFilterConfig,
) => (entry: string) => boolean;

export interface FilterConfig extends BaseFilterConfig {
  filterPredicateCreators?: FilterPredicateCreator[];
}
