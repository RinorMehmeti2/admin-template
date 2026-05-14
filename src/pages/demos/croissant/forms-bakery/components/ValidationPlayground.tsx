import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Card, CardContent } from '@/components/data-display/Card';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { Form, FormField, Input, useForm, zodResolver } from '@/components/forms';
import { Wiggle } from '@/components/motion';

interface Values {
  username: string;
  email: string;
  password: string;
  confirm: string;
}

const TAKEN = new Set(['admin', 'baker', 'root']);

export function ValidationPlayground() {
  const { t } = useTranslation();
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [wiggleKey, setWiggleKey] = useState(0);

  const schema = useMemo(
    () =>
      z
        .object({
          username: z
            .string()
            .min(3, t('croissant.forms.validate.usernameMin'))
            .regex(/^[a-z0-9_]+$/i, t('croissant.forms.validate.usernameRegex')),
          email: z.string().email(t('croissant.forms.validate.email')),
          password: z.string().min(6, t('croissant.forms.validate.passwordMin')),
          confirm: z.string(),
        })
        .refine((v) => v.password === v.confirm, {
          message: t('croissant.forms.validate.confirm'),
          path: ['confirm'],
        }),
    [t],
  );

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { username: '', email: '', password: '', confirm: '' },
  });
  const { register, formState, watch, setError } = form;
  const username = watch('username');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (username === undefined || username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    const id = window.setTimeout(() => {
      if (TAKEN.has(username.toLowerCase())) {
        setUsernameStatus('taken');
        setError('username', { type: 'manual', message: t('croissant.forms.validate.usernameTaken') });
      } else {
        setUsernameStatus('available');
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [username, setError, t]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const onSubmit = () => {
    setError('email', { type: 'server', message: t('croissant.forms.validate.email422') });
    setWiggleKey((k) => k + 1);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <Wiggle key={`u-${wiggleKey}`} force={false}>
            <FormField
              label={t('croissant.forms.validate.usernameLabel')}
              error={formState.errors.username?.message}
              description={
                usernameStatus === 'checking'
                  ? t('croissant.forms.validate.checking')
                  : usernameStatus === 'available'
                    ? t('croissant.forms.validate.available')
                    : undefined
              }
            >
              <Input
                {...register('username')}
                rightIcon={
                  usernameStatus === 'taken' ? (
                    <Badge variant="danger" size="sm">
                      taken
                    </Badge>
                  ) : usernameStatus === 'available' ? (
                    <Badge variant="success" size="sm">
                      ok
                    </Badge>
                  ) : null
                }
              />
            </FormField>
          </Wiggle>

          <Wiggle key={`e-${wiggleKey}`} force={false}>
            <FormField
              label={t('croissant.forms.validate.emailLabel')}
              error={formState.errors.email?.message}
            >
              <Input type="email" {...register('email')} />
            </FormField>
          </Wiggle>

          <FormField
            label={t('croissant.forms.validate.passwordLabel')}
            error={formState.errors.password?.message}
          >
            <Input type="password" {...register('password')} />
          </FormField>

          <FormField
            label={t('croissant.forms.validate.confirmLabel')}
            error={formState.errors.confirm?.message}
          >
            <Input type="password" {...register('confirm')} />
          </FormField>

          <Button type="submit" variant="primary">
            {t('croissant.forms.validate.submit')}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
