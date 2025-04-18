import {
  getInput,
  getMultilineInput,
  setFailed,
  info,
  setOutput,
} from '@actions/core';
import { context, getOctokit } from '@actions/github';

import { GithubInput } from './src/types';
import { ParserService } from './src/parser.service';
import { FilterService } from './src/filter.service';

const input: GithubInput = {
  token: getInput('token', { required: true }),
  folder: getInput('folder', { required: false }),
  exclude: getMultilineInput('exclude', { required: false }),
  include: getMultilineInput('include', { required: false }),
  context: context,
};

(async () => {
  const github = getOctokit(input.token);
  const parser = new ParserService(input.context, github);

  const parsed = await parser.diff();

  if (parsed.completed === false) {
    return setFailed(parsed.error);
  }

  const filter = new FilterService({
    root: input.folder,
    include: input.include,
    exclude: input.exclude,
  });

  const matrix = filter.filter(parsed.files);

  console.log('Will set output matrix:', JSON.stringify({ services: matrix }));

  if (!matrix) {
    info(
      `Unable to construct a valid services matrix. The diff may only include files outside the expected folder (${input.folder}), or there might be no changes at all. Returning an empty matrix.`,
    );
  }

  setOutput('matrix', JSON.stringify({ services: matrix }));
})();
