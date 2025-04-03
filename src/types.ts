import { Context } from '@actions/github/lib/context';
import { getOctokit } from '@actions/github';

export type GithubInput = {
  folder?: string;
  exclude?: string[];
  include?: string[];
  token?: string;
  context: Context;
}

export type GitHub = ReturnType<typeof getOctokit>;
