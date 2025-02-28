![tests](https://github.com/CrusaderX/changes/actions/workflows/ci.yaml/badge.svg?event=push)

# Typescript action: get matrix from changed files

This action analyzes the changes in your repository to determine which directories (or services) have been modified. It is particularly useful for monorepos, where you may want to run specific workflows (e.g. tests or builds) only on the services that have been updated.


## Inputs

### `token`

**Required** GitHub token. The default `GITHUB_TOKEN` is sufficient.

### `folder`

Specifies the root folder to search for changes, default is current directory

Default: '' (no filter)

Example:

```yaml
folder: 'service'
```
### `include`

A regular expression to filter and include specific folders from the payload.

Default: '' (no filter)

Example:


```yaml
include: '**/api/**'
```


### `exclude`

A regular expression or a comma-separated list to exclude certain file names or directories from the payload.

Default: '' (no filter)

Example:

```yaml
exclude: service1,service2
```

```yaml
exclude: |
  service1
  service2
  **/apps/**
  ...
```

## Outputs

### `matrix`

The action outputs a JSON object representing the matrix of changed services.

```json
{ "services": [] }
```

## Example Usage with a Monorepo

If you have a monorepository where services are located in the root (or under a specific folder), simply omit or adjust the folder input accordingly (default is current directory .).

Repository structure example:


```shell
├── services/
│   ├── auth/
│   │   ├── index.js
│   │   └── blog/
│   │       ├── index.html
|   |           ... // changes were made here
│   └── pizza/
│       └── index.js
|           ... // changes were made here
├── tests/
│   ├── unittests
├── venv/
├── setup.py
└── MANIFEST.in
```

```yaml
on:
  pull_request:
    types:
      - opened
      - synchronize
      - closed

jobs:
  services:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.changes.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: find changed services
        id: changes
        uses: CrusaderX/changes@v2
        with:
          folder: 'services'
          token: ${{ secrets.GITHUB_TOKEN }}

  tests:
    needs: [services]
    if: ${{ fromJSON(needs.services.outputs.matrix).services[0] }}
    runs-on: ubuntu-latest
    strategy:
      matrix: ${{ fromJson(needs.services.outputs.matrix) }}
      fail-fast: false
    steps:
      - run: |
          echo ${{ matrix.services }} was changed!
```

More examples of how to use and configure the action (including tests for various use cases) can be found in the tests folder of the repository.

