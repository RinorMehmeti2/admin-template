import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';

export default {
  title: 'Layout/AppLayout',
  component: AppLayout,
};

export const Default = {
  render: () => (
    <MemoryRouter initialEntries={['/primitives']}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route
            path="primitives"
            element={
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Primitives</h2>
                <p className="text-foreground-muted">Page content area.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>
  ),
};
