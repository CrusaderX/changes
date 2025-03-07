import { Context } from '@actions/github/lib/context';

import { IParserOutput } from './parser.types';
import { GitHub } from './types';

export class ParserService {
  private readonly initialBase = '0000000000000000000000000000000000000000'
  private readonly diffStatuses = new Set([
    'added',
    'renamed',
    'removed',
    'modified',
  ]);

  private base: string;
  private head: string;
  private client: GitHub;
  private context: Context;

  constructor(context: Context, client: GitHub) {
    this.context = context;
    this.client = client;
  }

  public diff(): Promise<IParserOutput> {
    this.parseSHA();

    return this.base === this.initialBase
      ? this.initialCommitDiff()
      : this.defaultCommitDiff();
  }

  public parseSHA(): void {
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
        throw new Error('Unsupported event type');
    }
  }

  private async initialCommitDiff(): Promise<IParserOutput> {
    const response = await this.client.rest.repos.getCommit({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      ref: this.head,
    });

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

  private async defaultCommitDiff(): Promise<IParserOutput> {
    const response = await this.client.rest.repos.compareCommits({
      base: this.base,
      head: this.head,
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      per_page: 300,
    });

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
