import { getInput, getMultilineInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import { IGithubInput, IParserOutput } from './src/types';
import { ParserService } from './src/parser.service';
import { FilterService } from './src/filter.service';

const input: IGithubInput = {
  token: getInput('token', { required: true }),
  folder: getInput('folder', { required: false }),
  exclude: getMultilineInput('exclude', { required: false }),
  include: getMultilineInput('include', { required: false }),
  context: context,
};

(async () => {
  const parser = new ParserService(input.context);
  const github = getOctokit(input.token);

  parser.parse();

  const diff: IParserOutput = await parser.diff({ client: github });

  if (!diff.completed) {
    setFailed(`Failed to get git diff with error ${diff.error}`);
    return;
  }

  const filter = new FilterService({
    files: diff.files,
    root: input.folder,
    include: input.include,
    exclude: input.exclude,
  });
  const matrix = filter.filter();
  console.log(matrix);
})();
