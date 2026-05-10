/*
 * In-memory user fixtures for the /api/users mock endpoint. Lives in src/mocks
 * so handlers + tests can both import it.
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Viewer';
  status: 'Active' | 'Invited' | 'Suspended';
  lastSeenDays: number;
}

const FIRST = [
  'Ada',
  'Grace',
  'Linus',
  'Margaret',
  'Alan',
  'Edsger',
  'Donald',
  'Barbara',
  'Niklaus',
  'Bjarne',
];
const LAST = [
  'Lovelace',
  'Hopper',
  'Torvalds',
  'Hamilton',
  'Turing',
  'Dijkstra',
  'Knuth',
  'Liskov',
  'Wirth',
  'Stroustrup',
];
const ROLES: MockUser['role'][] = ['Admin', 'Member', 'Viewer'];
const STATUSES: MockUser['status'][] = ['Active', 'Invited', 'Suspended'];

export function makeMockUsers(n: number = 50): MockUser[] {
  return Array.from({ length: n }).map((_, i) => {
    const f = FIRST[i % FIRST.length]!;
    const l = LAST[(i * 7) % LAST.length]!;
    return {
      id: `u_${i + 1}`,
      name: `${f} ${l}`,
      email: `${f.toLowerCase()}.${l.toLowerCase()}${i + 1}@example.com`,
      role: ROLES[i % ROLES.length]!,
      status: STATUSES[i % STATUSES.length]!,
      lastSeenDays: (i * 13) % 60,
    };
  });
}

export const MOCK_USERS: MockUser[] = makeMockUsers(50);
