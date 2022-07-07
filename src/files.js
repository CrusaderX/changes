const commitDiff = async (client, payload) => {
  const response = await client.repos.compareCommits({
    base: payload.base,
    head: payload.head,
    owner: payload.repo.owner,
    repo: payload.repo.repo,
  });
  
  if (response.status !== 200) {
    core.setFailed(
      `Couldn't get response from github, data: ${response.data} and status code: ${response.status}`
    );
  };

  const files = response.data.files;
  const statuses = ['added', 'renamed', 'removed', 'modified'];

  return files
    .filter(file => statuses.includes(file.status))
}

module.exports = { commitDiff }