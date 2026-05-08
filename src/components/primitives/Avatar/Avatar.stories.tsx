import { Avatar } from './Avatar';

export default { title: 'Primitives/Avatar', component: Avatar };

export const Sizes = {
  render: () => (
    <div className="flex items-end gap-2">
      <Avatar name="Ada Lovelace" size="xs" />
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" size="md" />
      <Avatar name="Ada Lovelace" size="lg" />
      <Avatar name="Ada Lovelace" size="xl" />
    </div>
  ),
};

export const InitialsFallback = {
  render: () => (
    <div className="flex items-center gap-2">
      <Avatar name="Ada Lovelace" />
      <Avatar name="Bob Marley" />
      <Avatar name="Cher" />
      <Avatar name="Diego Velazquez" />
      <Avatar name="Eve" />
      <Avatar name="Felix Mendelssohn" />
    </div>
  ),
};

export const Image = {
  render: () => (
    <Avatar src="https://i.pravatar.cc/64?img=12" name="Pravatar" />
  ),
};

export const WithStatus = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Online User" status="online" />
      <Avatar name="Away User" status="away" />
      <Avatar name="Busy User" status="busy" />
      <Avatar name="Offline User" status="offline" />
    </div>
  ),
};
