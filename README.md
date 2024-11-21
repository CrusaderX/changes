# Javascript action: get matrix from changed files

Find changes in changed directories based on input and construct a matrix with changed. For instance, if you have monorepository, that would be helpful to run some actions on a specific set of changed services in parallel (matrix) way.

## Inputs

### `token`

**Required** github token, default GITHUB_TOKEN will be enough

### `folder`

Where do we have to search changes

Default: .

Example: 
```yaml
folder: 'service'
```

### `exclude`

Which file names should we exclude from payload

Default: ''

Example: 
```yaml
exclude: service1,service2
```
```yaml
exclude: |
  service1
  service2
  ...
```

## Outputs

### `matrix`

```json
{ "services": [] }
```

## Example usage with monorepo

If you have monorepository with services in root - omit folder name, default is current directory - .

Repository folder structure in example action:

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
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: find changed services
        id: changes
        uses: CrusaderX/changes@v1
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
          echo ${{ matrix.services }} was changed! # will output auth and pizza becase changes were made there
```
