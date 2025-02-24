import { FilterService } from '../src/filter.service';

describe('FilterService', () => {
  const changedFiles = [
    'services/auth-service/package.json',
    'services/auth-service/src/index.ts',
    'services/auth-service/tests/auth.test.ts',
    'services/user-service/src/index.ts',
    'services/user-service/README.md',
    'services/order-service/src/controller.ts',
    'services/order-service/src/utils/orderHelper.ts',
    'services/payment-service/docs/api.md',
    'packages/ui-library/app1/components/Button.jsx',
    'packages/ui-library/app1/components/Modal.jsx',
    'packages/ui-library/tests/button.test.js',
    'tools/deployment/terraform/main.tf',
    'tools/deployment/ansible/inventory.yaml',
    'README.md',
    '.github/workflows/ci.yml',
    'services/test-service/test/app.test.ts',
    'services/test-service/src/app.ts',
  ];

  it.each([
    {
      name: 'Scenario 1: No root, no includes, no excludes => returns everything',
      folder: '',
      include: [],
      exclude: [],
      expected: ['services', 'packages', 'tools'],
    },
    {
      name: 'Scenario 2: Root is "services", no includes, no excludes => only service-related files',
      folder: 'services',
      include: [],
      exclude: [],
      expected: [
        'services/auth-service',
        'services/user-service',
        'services/order-service',
        'services/payment-service',
        'services/test-service',
      ],
    },
    {
      name: 'Scenario 3: Root is "services", include = ["**/tests/**"], no excludes => only test files under services',
      folder: 'services',
      include: ['**/tests/**'],
      exclude: [],
      expected: ['services/auth-service'],
    },
    {
      name: 'Scenario 4: Root is "services", include multiple patterns, exclude with wildcard',
      folder: 'services',
      include: ['**/user-service/**', '**/order-service/**'],
      exclude: ['**/src/**'],
      expected: ['services/user-service'],
    },
    {
      name: 'Scenario 5: Root in "services", include = ["**/*.ts"], exclude = ["**/tests/**"] => All TypeScript but not tests',
      folder: 'services',
      include: ['**/*.ts'],
      exclude: ['**/tests/**'],
      expected: [
        'services/auth-service',
        'services/user-service',
        'services/order-service',
        'services/test-service',
      ],
    },
    {
      name: 'Scenario 6: Root = "packages/ui-library", include = ["**/*.{jsx,js}"], exclude = ["**/tests/**"]',
      folder: 'packages/ui-library',
      include: ['**/*.{jsx,js}'],
      exclude: ['**/tests/**'],
      expected: ['packages/ui-library/app1'],
    },
    {
      name: 'Scenario 7: Complex scenario with root "services/", multiple include/exclude patterns',
      folder: 'services/',
      include: ['**/*.ts', '**/*.test.ts'],
      exclude: ['**/auth-service/**', '**/payment-service/**'],
      expected: [
        'services/user-service',
        'services/order-service',
        'services/test-service',
      ],
    },
    {
      name: 'Scenario 8: Root = "tools/", no include, exclude = ["**/ansible/**"] => filters out ansible paths',
      folder: 'tools/',
      include: [],
      exclude: ['**/ansible/**'],
      expected: ['tools/deployment'],
    },
    {
      name: 'Scenario 9: Root = "services/test-service", include = ["**/*.test.ts"], exclude = []',
      folder: 'services/test-service',
      include: ['**/*.test.ts'],
      exclude: [],
      expected: ['services/test-service/test'],
    },
    {
      name: 'Scenario 10: Root = "services", include = [services/user-service/*], exclude = [*]',
      folder: 'services',
      include: ['services/user-service/*'],
      exclude: ['*'],
      expected: ['services/user-service'],
    },
  ])('$name', ({ folder, include, exclude, expected }) => {
    const filter = new FilterService({
      files: changedFiles,
      root: folder,
      include,
      exclude,
    });
    const output = filter.filter();
    expect(output).toEqual(expected);
  });
});
