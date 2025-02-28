import { Context } from '@actions/github/lib/context';
import { getOctokit } from '@actions/github';

export interface IGithubInput {
  folder?: string;
  exclude?: string[];
  include?: string[];
  token: string;
  context: Context;
}

export type GitHub = ReturnType<typeof getOctokit>;
