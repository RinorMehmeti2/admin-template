import { http, HttpResponse, delay } from 'msw';
import { MOCK_USERS, type MockUser } from './fixtures';

/*
 * MSW handlers for demo endpoints. Currently /api/users — paginated +
 * searchable list, single-user fetch, optimistic-update friendly endpoints.
 * Add more handlers here as new resources demand mocking.
 */

interface UsersListResponse {
  data: MockUser[];
  total: number;
  page: number;
  pageSize: number;
}

export const handlers = [
  http.get('/api/users', async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const search = (url.searchParams.get('search') ?? '').toLowerCase().trim();

    const filtered =
      search.length === 0
        ? MOCK_USERS
        : MOCK_USERS.filter(
            (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
          );

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json<UsersListResponse>({
      data,
      total: filtered.length,
      page,
      pageSize,
    });
  }),

  http.get('/api/users/:id', async ({ params }) => {
    await delay(150);
    const user = MOCK_USERS.find((u) => u.id === params.id);
    if (user === undefined) {
      return HttpResponse.json({ code: 'not_found', message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),
];
