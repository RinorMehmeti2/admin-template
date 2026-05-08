import { Mail } from 'lucide-react';
import { List, ListItem } from './List';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Card } from '../Card';

export default { title: 'Data Display/List', component: List };

export const Basic = {
  render: () => (
    <Card variant="outlined" className="max-w-sm">
      <List variant="divided">
        <ListItem primary="Inbox" trailing={<Badge>12</Badge>} leading={<Mail className="h-4 w-4" />} />
        <ListItem primary="Drafts" trailing={<Badge>3</Badge>} leading={<Mail className="h-4 w-4" />} />
        <ListItem primary="Archive" leading={<Mail className="h-4 w-4" />} />
      </List>
    </Card>
  ),
};

export const People = {
  render: () => (
    <Card variant="outlined" className="max-w-sm">
      <List variant="divided">
        <ListItem
          leading={<Avatar name="Ada Lovelace" size="sm" />}
          primary="Ada Lovelace"
          secondary="ada@example.com"
          trailing={<Badge variant="success">Active</Badge>}
        />
        <ListItem
          leading={<Avatar name="Grace Hopper" size="sm" />}
          primary="Grace Hopper"
          secondary="grace@example.com"
          trailing={<Badge variant="warning">Invited</Badge>}
        />
      </List>
    </Card>
  ),
};
