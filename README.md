![tests](https://github.com/CrusaderX/changes/actions/workflows/ci.yaml/badge.svg?event=push)

# Changes v3

This action analyzes the changes in your repository to determine which directories (or services) have been modified. It is particularly useful for monorepos, where you may want to run specific workflows (e.g. tests or builds) only on the services that have been updated.


# What's new

Please refer to the [release page](https://github.com/CrusaderX/changes/releases/latest) for the latest release notes.

# Usage

<!-- start usage -->
```yaml
- uses: CrusaderX/changes@v3
  with:
    # Personal access token (PAT) used to fetch the repository. The PAT is configured
    # with the local git config, which enables your scripts to run authenticated git
    # commands. The post-job step removes the PAT.
    #
    # We recommend using a service account with the least permissions necessary. Also
    # when generating a new PAT, select the least scopes necessary.
    #
    # [Learn more about creating and using encrypted secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)
    #
    # Default: ${{ github.token }}
    token: ''

    # Specifies the root folder to search for changes or where you applicastion are
    # located. When we parse the commit diff we will filter diff that starts with that
    # folder.
    folder: ''

    # A regular expression to filter and include specific folders from the payload.
    include: ''

    # A regular expression or a comma-separated list to exclude certain file names 
    # or directories from the payload.
    exclude: ''
```
<!-- end usage -->

# Outputs

### `matrix`

The action outputs a JSON object representing the matrix of changed services as folder names.

```json
{ "services": [] }
```

# Example usage with a monorepo

If you have a monorepository where services are located in the root (or under a specific folder), simply omit or adjust the folder input accordingly (default is current directory .).

Repository structure example:


```shell
├── services/
│   ├── auth/
│   │   ├── index.js
│   │   └── blog/
│   │       ├── index.html
│   │           ... // changes were made here
│   └── pizza/
│       └── index.js
│           ... // changes were made here
├── tests/
│   └── base.test.ts
├── README.md
└── CODEOWNERS
```

```yaml
on:
  push:
    branches:
      - main
  pull_request:
    types:
      - opened
      - synchronize
      - closed

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.changes.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4
      - uses: CrusaderX/changes@v3
        id: changes
        with:
          folder: 'services'
          token: ${{ secrets.GITHUB_TOKEN }}

  tests:
    needs: [changes]
    if: ${{ fromJSON(needs.changes.outputs.matrix).services[0] }}
    runs-on: ubuntu-latest
    strategy:
      matrix: ${{ fromJson(needs.services.outputs.matrix) }}
      fail-fast: false
    steps:
      - run: |
          echo ${{ matrix.services }} was changed!
```

# Scenarios

Below is the list of changed files used in these scenarios:

```text
services/auth-service/package.json
services/auth-service/src/index.ts
services/auth-service/tests/auth.test.ts
services/user-service/src/index.ts
services/user-service/README.md
services/order-service/src/controller.ts
services/order-service/src/utils/orderHelper.ts
services/payment-service/docs/api.md
packages/ui-library/app1/components/Button.jsx
packages/ui-library/app1/components/Modal.jsx
packages/ui-library/tests/button.test.js
tools/deployment/terraform/main.tf
tools/deployment/ansible/inventory.yaml
README.md
.github/workflows/ci.yml
services/test-service/test/app.test.ts
services/test-service/src/app.ts
```

For each scenario below, a YAML document is provided that indicates:

* The target folder (folder)
* The include patterns (include)
* The exclude patterns (exclude)
* A comment with the expected output

## Scenario 1: No root, no includes, no excludes

```yaml
- uses: CrusaderX/changes@v3
  id: changes

# Expected Output:
# - services
# - packages
# - tools
```

## Scenario 2: Root is "services", no includes, no excludes

```yaml
- uses: CrusaderX/changes@v3
  id: changes
  with:
    folder: "services"

# Expected Output:
# - services/auth-service
# - services/user-service
# - services/order-service
# - services/payment-service
# - services/test-service
```


## Scenario 3: Root is "services", include = ["/tests/"], no excludes

```yaml
- uses: CrusaderX/changes@v3
  id: changes
  with:
    folder: "services"
    include: "**/tests/**"

# Expected Output:
# - services/auth-service
```

## Scenario 4: Root is "services", include multiple patterns, exclude with wildcard

```yaml
- uses: CrusaderX/changes@v3
  id: changes
  with:
    folder: "services"
    include: |
      "**/user-service/**"
      "**/order-service/**"
    exclude: "**/src/**"

# Expected Output:
# - services/user-service
```

## Scenario 5: Root in "services", include = ["/*.ts"], exclude = ["/tests/**"]

```yaml
- uses: CrusaderX/changes@v3
  id: changes
  with:
    folder: "services"
    include: "**/*.ts"
    exclude: "**/tests/**"

# Expected Output:
# - services/auth-service
# - services/user-service
# - services/order-service
# - services/test-service
```

## Scenario 6: Nested services location. Root = "packages/ui-library", include = ["/*.{jsx,js}"], exclude = ["/tests/**"]

```yaml
- uses: CrusaderX/changes@v3
  id: changes
  with:
    folder: "packages/ui-library"
    include: "**/*.{jsx,js}"
    exclude: "**/tests/**"

# Expected Output:
# - packages/ui-library/app1
```

## Scenario 7: Complex scenario with root "services/", multiple include/exclude patterns

```yaml
- uses: CrusaderX/changes@v3
  id: changes
  with:
    folder: "services/"
    include: |
      "**/*.ts"
      "**/*.test.ts"
    exclude: |
      "**/auth-service/**"
      "**/payment-service/**"

# Expected Output:
# - services/user-service
# - services/order-service
# - services/test-service
```

## Scenario 8: Root = "tools/", no include, exclude = ["/ansible/"]

```yaml
- uses: CrusaderX/changes@v3
  id: changes
  with:
    folder: "tools/"
    exclude: |
      "**/ansible/**"

# Expected Output:
# - tools/deployment
```

## Scenario 9: Root = "services", include = ["services/user-service/"], exclude = [""]


```yaml
- uses: CrusaderX/changes@v3
  id: changes
  with:
    folder: "services"
    include: "services/user-service/*"
    exclude: "*"

# Expected Output:
# - services/user-service
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
