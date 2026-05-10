import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/*
 * MSW server for tests. Started/stopped per-suite — see usage in
 * src/data/__tests__ files. Not auto-mounted globally so individual tests
 * can opt in or override handlers without affecting unrelated suites.
 */

export const server = setupServer(...handlers);
