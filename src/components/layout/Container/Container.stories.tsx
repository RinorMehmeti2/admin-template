import { Container } from './Container';

export default { title: 'Layout/Container', component: Container };

export const Default = {
  render: () => (
    <Container className="bg-surface-muted py-6">
      <p className="text-sm">Default container (lg).</p>
    </Container>
  ),
};
