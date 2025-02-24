import { getInput, getMultilineInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import { IGithubInput } from './src/types';
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

  const parsed = await parser.diff({ client: github });

  if (!parsed.completed) {
    return setFailed(parsed.error);
  }

  const filter = new FilterService({
    root: input.folder,
    include: input.include,
    exclude: input.exclude,
  });

  const matrix = filter.filter(parsed.files);
  console.log(matrix);
})();
