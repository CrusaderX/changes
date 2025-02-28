import { Context } from '@actions/github/lib/context';
import { setFailed } from '@actions/core';

import { IParserOutput } from './parser.types';
import { GitHub } from './types';

export class ParserService {
  private readonly diffStatuses = new Set([
    'added',
    'renamed',
    'removed',
    'modified',
  ]);

  private base: string;
  private head: string;
  private context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  public parse() {
    this.parseSHA();
  }

  private parseSHA(): void {
    switch (this.context.eventName) {
      case 'pull_request':
        this.base = this.context.payload?.pull_request?.base.sha;
        this.head = this.context.payload?.pull_request?.head.sha;
        break;
      case 'push':
        this.base = this.context.payload.before;
        this.head = this.context.payload.after;
        break;
      default:
        setFailed(
          'Failed to determine event type, only push and pull_request events are supported',
        );
    }
  }

  public async diff({ client }: { client: GitHub }): Promise<IParserOutput> {
    if (this.base === '0000000000000000000000000000000000000000') {
      // TODO: return all files?
      return {
        completed: false,
        error: 'Base is 0000000000000000000000000000000000000000',
      };
    }

    // TODO: pagination?
    const response = await client.rest.repos.compareCommits({
      base: this.base,
      head: this.head,
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      per_page: 300,
    });

    if (response.status !== 200) {
      return {
        completed: false,
        error: `Couldn't get response from github, data: ${response.data} and status code: ${response.status}`,
      };
    }

    const { data } = response;
    const { files } = data;

    if (!files) {
      return {
        completed: false,
        error: `Couldn't get response from github, files: ${files} and status code: ${response.status}`,
      };
    }

    const filenames = files
      .filter(file => this.diffStatuses.has(file.status))
      .map(file => file.filename);

    return { completed: true, files: filenames };
  }
}
