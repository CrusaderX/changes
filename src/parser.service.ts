import { Context } from '@actions/github/lib/context';

import { IParserOutput, IFile } from './parser.types';
import { GitHub } from './types';

export class ParserService {
  private readonly initialBase = '0000000000000000000000000000000000000000';
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

  public async diff(): Promise<IParserOutput> {
    if (!this.parseSHA()) {
      return {
        completed: false,
        error: 'Could not parse SHA',
      };
    }

    const files =
      this.base === this.initialBase
        ? await this.initialCommitDiff()
        : await this.defaultCommitDiff();

    if (!files) {
      return {
        completed: false,
        error:
          "Couldn't get response from github or files have not been changed",
      };
    }

    const filenames = files
      .filter((file: IFile) => this.diffStatuses.has(file.status)) // TODO: validate that we need to filter out by status
      .map((file: IFile) => file.filename);

    return { completed: true, files: filenames };
  }

  private parseSHA(): boolean {
    switch (this.context.eventName) {
      case 'pull_request':
        this.base = this.context.payload.pull_request.base.sha;
        this.head = this.context.payload.pull_request.head.sha;
        return true;
      case 'push':
        this.base = this.context.payload.before;
        this.head = this.context.payload.after;
        return true;
      default:
        return;
    }
  }

  private async initialCommitDiff(): Promise<IFile[]> {
    const page = await this.client.paginate(this.client.rest.repos.getCommit, {
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      ref: this.head,
    });

    return page.flatMap((page: any) => page.data.files || []);
  }

  private async defaultCommitDiff(): Promise<IFile[]> {
    const response = await this.client.rest.repos.compareCommits({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      base: this.base,
      head: this.head,
    });

    const shas = response.data.commits.map(commit => commit.sha);

    if (!shas.length) return [];

    const files = await Promise.all(
      shas.map(async (sha) => {
        const page = await this.client.paginate(
          this.client.rest.repos.getCommit,
          {
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            ref: sha,
          }
        );
        console.log(page);
        return page.flatMap((page: any) => page.data.files || []);
      })
    );

    return files.flat();
  }
}
