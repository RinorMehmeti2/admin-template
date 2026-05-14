import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Send, ThumbsUp } from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Card, CardContent } from '@/components/data-display/Card';
import { Textarea } from '@/components/forms/Textarea';
import { SlideInUp } from '@/components/motion';

interface Comment {
  id: number;
  name: string;
  text: string;
  at: string;
  likes: number;
  loves: number;
}

const SEED: Comment[] = [
  {
    id: 1,
    name: 'Ada Lovelace',
    text: 'Best croissant batch this week. Crumb is perfect.',
    at: '08:14',
    likes: 4,
    loves: 2,
  },
  {
    id: 2,
    name: 'Grace Hopper',
    text: 'We need more almond paste by Saturday — bumping the order.',
    at: '08:42',
    likes: 2,
    loves: 0,
  },
  {
    id: 3,
    name: 'Linus Torvalds',
    text: 'Oven C had a hot spot. Worth checking the element.',
    at: '09:01',
    likes: 1,
    loves: 0,
  },
  {
    id: 4,
    name: 'Margaret Hamilton',
    text: 'Latte art class went well, six newbies signed up.',
    at: '09:30',
    likes: 5,
    loves: 3,
  },
  {
    id: 5,
    name: 'Alan Turing',
    text: 'Delivery route 2 was 18 min faster today. Logged.',
    at: '10:11',
    likes: 3,
    loves: 1,
  },
];

export function CommentsThread() {
  const { t } = useTranslation();
  const [comments, setComments] = useState<ReadonlyArray<Comment>>(SEED);
  const [draft, setDraft] = useState('');

  const send = () => {
    if (draft.trim() === '') return;
    const next: Comment = {
      id: comments.length + 100,
      name: 'You',
      text: draft.trim(),
      at: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      loves: 0,
    };
    setComments([...comments, next]);
    setDraft('');
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <ul className="space-y-4">
          {comments.map((c) => {
            const inner = (
              <li key={c.id} className="flex items-start gap-3">
                <Avatar size="sm" name={c.name} />
                <div className="min-w-0 flex-1 rounded-md bg-surface-muted/40 px-3 py-2">
                  <p className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">{c.name}</span>
                    <time className="text-xs text-foreground-subtle">{c.at}</time>
                  </p>
                  <p className="mt-1 text-sm text-foreground">{c.text}</p>
                  <div className="mt-1.5 inline-flex items-center gap-3 text-xs text-foreground-muted">
                    <IconButton
                      aria-label={t('croissant.timeline.comments.like')}
                      variant="ghost"
                      size="sm"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </IconButton>
                    <span className="tabular-nums">{c.likes}</span>
                    <IconButton
                      aria-label={t('croissant.timeline.comments.love')}
                      variant="ghost"
                      size="sm"
                    >
                      <Heart className="h-3 w-3" />
                    </IconButton>
                    <span className="tabular-nums">{c.loves}</span>
                  </div>
                </div>
              </li>
            );
            return c.id >= 100 ? <SlideInUp key={c.id}>{inner}</SlideInUp> : inner;
          })}
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mt-4 flex items-end gap-2"
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            className="flex-1"
            placeholder={t('croissant.timeline.comments.placeholder')}
            aria-label={t('croissant.timeline.comments.placeholder')}
          />
          <Button
            type="submit"
            leftIcon={<Send className="h-4 w-4" />}
            disabled={draft.trim() === ''}
          >
            {t('croissant.timeline.comments.send')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
