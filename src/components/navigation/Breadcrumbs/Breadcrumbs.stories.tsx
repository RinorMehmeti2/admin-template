import { MemoryRouter } from 'react-router-dom';
import {
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  Breadcrumbs,
} from './Breadcrumbs';

export default { title: 'Navigation/Breadcrumbs', component: Breadcrumbs };

export const Default = {
  render: () => (
    <MemoryRouter>
      <Breadcrumbs>
        <BreadcrumbItem><BreadcrumbLink to="/">Home</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbLink to="/users">Users</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbCurrent>Edit profile</BreadcrumbCurrent></BreadcrumbItem>
      </Breadcrumbs>
    </MemoryRouter>
  ),
};
