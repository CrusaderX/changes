import { IFile, IGetCommit } from './parser.types';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

/**
 * A generic helper to paginate through GitHub API responses.
 *
 * @param fn - The GitHub API method that returns a paginated response.
 * @param params - The parameters to pass to the API method.
 * @returns An array of all items from all pages.
 */
export async function paginate(
  fn: (
    params: IGetCommit,
  ) => Promise<RestEndpointMethodTypes['repos']['getCommit']['response']>,
  params: any,
): Promise<IFile[]> {
  const files: IFile[] = [];
  let page = 1;

  while (true) {
    const response = await fn({ ...params, page });
    const linkHeader = response.headers.link;

    files.push(...response.data.files);

    if (linkHeader && linkHeader.includes('rel=\"next\"')) {
      page++;
      continue;
    }
    break;
  }

  return files;
}
