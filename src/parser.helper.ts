import { IFile } from './parser.types';

/**
 * A generic helper to paginate through GitHub API responses.
 *
 * @param fn - The GitHub API method that returns a paginated response.
 * @param params - The parameters to pass to the API method.
 * @returns An array of all items from all pages.
 */
export async function paginateGitHub(
  fn: (_: any) => Promise<any>,
  params: any,
): Promise<IFile[]> {
  const files: IFile[] = [];
  let page = 1;

  while (true) {
    const response = await fn({ ...params, page });
    const linkHeader = response.headers.link;

    console.log('linkHeader', linkHeader); // debug
    files.push(...response.data.files);

    if (linkHeader && linkHeader.includes('rel=\"next\"')) {
      page++;
      continue;
    }
    break;
  }

  return files;
}
