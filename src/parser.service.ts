import { Context } from '@actions/github/lib/context';

import { ParserOutput, CommitFile } from './parser.types';
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

  public async diff(): Promise<ParserOutput> {
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
      .filter((file: CommitFile) => this.diffStatuses.has(file.status)) // TODO: validate that we need to filter out by status
      .map((file: CommitFile) => file.filename);

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

  private async initialCommitDiff(): Promise<CommitFile[]> {
    /**
     * Retrieves the file diff for a single commit (initial commit).
     *
     * This function uses Octokit's built-in pagination to fetch all pages of file changes
     * for the commit referenced by `this.head`. It calls the GitHub API endpoint for a commit,
     * automatically aggregating the files array from each page. This is particularly useful
     * when a commit has more than 300 file changes (up to a limit of 3000 files).
     *
     * @returns A promise that resolves to an array of CommitFile objects representing all file changes.
     */
    const files = await this.client.paginate(
      this.client.rest.repos.getCommit,
      {
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        ref: this.head,
      },
      // Mapping callback: for each paginated response (commit), return its 'files' array.
      commit => commit.data?.files,
    );

    return files;
  }

  private async defaultCommitDiff(): Promise<CommitFile[]> {
    /**
     * Retrieves the combined file diff for a range of commits.
     *
     * This function first uses the `compareCommits` endpoint to get a list of commits between
     * the base and head references. It extracts the commit SHAs from the comparison result, and
     * for each commit, it uses Octokit's pagination to fetch all pages of file changes by calling
     * the `getCommit` endpoint. The results from all commits are aggregated into a single flattened
     * array of CommitFile objects.
     *
     * If no commits are found in the comparison, an empty array is returned.
     *
     * @returns A promise that resolves to an array of CommitFile objects representing the file changes
     * across the commit range.
     */
    const response = await this.client.rest.repos.compareCommits({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      base: this.base,
      head: this.head,
    });

    const shas = response.data.commits.map(commit => commit.sha);

    if (!shas.length) return [];

    const files: CommitFile[][] = await Promise.all(
      shas.map((sha: string) =>
        this.client.paginate(
          this.client.rest.repos.getCommit,
          {
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            ref: sha,
          },
          commit => commit.data?.files,
        ),
      ),
    );

    return files.flat();
  }
}
