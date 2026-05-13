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

  /* -------------------- /forms/* demo endpoints -------------------- */

  // 422 with per-field errors. The demo intentionally hard-codes an
  // "invalid" branch — submitting with username "taken" returns errors.
  http.post('/api/demo/forms/validate', async ({ request }) => {
    await delay(600);
    const body = (await request.json().catch(() => null)) as
      | { username?: string; email?: string }
      | null;
    const errors: Record<string, string> = {};
    if (body?.username === 'taken' || body?.username === 'admin') {
      errors.username = 'That username is already taken';
    }
    if (body?.email !== undefined && !body.email.includes('@')) {
      errors.email = 'Invalid email address';
    }
    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { code: 'validation_failed', message: 'Validation failed', errors },
        { status: 422 },
      );
    }
    return HttpResponse.json({ ok: true });
  }),

  http.post('/api/demo/forms/submit', async () => {
    await delay(800);
    return HttpResponse.json({ ok: true, id: `order-${Date.now().toString(36)}` });
  }),

  http.post('/api/demo/forms/autosave', async () => {
    await delay(400);
    return HttpResponse.json({ ok: true, savedAt: new Date().toISOString() });
  }),

  http.get('/api/demo/forms/defaults', async () => {
    await delay(600);
    return HttpResponse.json({
      name: 'Alex Kowalski',
      email: 'alex.kowalski@acme.test',
      bio: 'Builds calm software for serious tools.',
      timezone: 'America/Los_Angeles',
      receiveDigest: true,
    });
  }),

  http.post('/api/demo/forms/check-username', async ({ request }) => {
    await delay(400);
    const body = (await request.json().catch(() => null)) as { username?: string } | null;
    const username = (body?.username ?? '').trim().toLowerCase();
    const reserved = new Set(['admin', 'root', 'test', 'system', 'support']);
    return HttpResponse.json({
      username,
      available: username.length > 0 && !reserved.has(username),
    });
  }),
];
