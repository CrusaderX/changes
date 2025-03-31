import { IFile } from './parser.types';

/**
 * A generic helper to paginate through GitHub API responses.
 *
 * @param apiMethod - The GitHub API method that returns a paginated response.
 * @param params - The parameters to pass to the API method.
 * @param perPage - The number of items per page (default is 100).
 * @returns An array of all items from all pages.
 */
export async function paginateGitHub(
  fn: (params: any) => Promise<any>,
  params: any,
  perPage: number = 3,
): Promise<IFile[]> {
  const files: IFile[] = [];
  let page = 1;

  while (true) {
    const response = await fn({ ...params, per_page: perPage, page });
    const linkHeader = response.headers.link;

    console.log('linkHeader', linkHeader);
    files.push(...response.data?.files);
    console.log('files', files);

    if (linkHeader && linkHeader.includes('rel=\"next\"')) {
      console.log('if statement', linkHeader);
      page++;
      console.log('page', page);
      continue;
    }
    break;
  }

  return files;
}
