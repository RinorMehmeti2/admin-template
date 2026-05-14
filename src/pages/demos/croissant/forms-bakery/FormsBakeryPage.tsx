import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, X } from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Switch } from '@/components/forms/Switch';
import { FormField, Input, useForm } from '@/components/forms';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/feedback/Drawer';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { QuickOrderForm } from './components/QuickOrderForm';
import { WholesaleWizard } from './components/WholesaleWizard';
import { RecipeInlineEdit } from './components/RecipeInlineEdit';
import { ValidationPlayground } from './components/ValidationPlayground';
import { useToast } from '@/context/ToastProvider';

interface Preferences {
  bakeryName: string;
  hours: string;
  notifyOrders: boolean;
  notifyRefunds: boolean;
  notifyLowStock: boolean;
  closedSundays: boolean;
}

const PREF_DEFAULTS: Preferences = {
  bakeryName: 'Croissant HQ',
  hours: '7 AM – 8 PM',
  notifyOrders: true,
  notifyRefunds: true,
  notifyLowStock: false,
  closedSundays: false,
};

export function FormsBakeryPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const prefsForm = useForm<Preferences>({ defaultValues: PREF_DEFAULTS });

  const savePrefs = prefsForm.handleSubmit((values) => {
    toast.success(t('croissant.forms.prefs.saved'), {
      description: t('croissant.forms.prefs.savedDesc', { name: values.bakeryName }),
    });
    setPrefsOpen(false);
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <SimsPageHeader
        title={t('croissant.forms.scene.title')}
        description={t('croissant.forms.scene.description')}
        actions={
          <>
            <Badge variant="info" size="sm" dot>
              {t('croissant.forms.meta.workflows', { n: 3 })}
            </Badge>
            <Badge variant="primary" size="sm">
              {t('croissant.forms.meta.live')}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Settings className="h-4 w-4" />}
              onClick={() => setPrefsOpen(true)}
            >
              {t('croissant.forms.prefs.open')}
            </Button>
          </>
        }
      />

      <section aria-labelledby="forms-quick" className="space-y-4">
        <div>
          <h2 id="forms-quick" className="text-lg font-semibold text-foreground">
            {t('croissant.forms.section.quick')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.forms.section.quickDesc')}
          </p>
        </div>
        <QuickOrderForm />
      </section>

      <section aria-labelledby="forms-wholesale" className="space-y-4">
        <div>
          <h2 id="forms-wholesale" className="text-lg font-semibold text-foreground">
            {t('croissant.forms.section.wholesale')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.forms.section.wholesaleDesc')}
          </p>
        </div>
        <WholesaleWizard />
      </section>

      <section aria-labelledby="forms-recipe" className="space-y-4">
        <div>
          <h2 id="forms-recipe" className="text-lg font-semibold text-foreground">
            {t('croissant.forms.section.recipe')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.forms.section.recipeDesc')}
          </p>
        </div>
        <RecipeInlineEdit />
      </section>

      <section aria-labelledby="forms-validate" className="space-y-4">
        <div>
          <h2 id="forms-validate" className="text-lg font-semibold text-foreground">
            {t('croissant.forms.section.validate')}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {t('croissant.forms.section.validateDesc')}
          </p>
        </div>
        <ValidationPlayground />
      </section>

      <Drawer open={prefsOpen} onOpenChange={setPrefsOpen} side="right" responsive={false}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>{t('croissant.forms.prefs.title')}</DrawerTitle>
            <IconButton
              aria-label={t('croissant.forms.prefs.cancel')}
              variant="ghost"
              size="sm"
              onClick={() => setPrefsOpen(false)}
            >
              <X className="h-4 w-4" />
            </IconButton>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <form className="space-y-4">
              <FormField label={t('croissant.forms.prefs.bakeryName')}>
                <Input {...prefsForm.register('bakeryName')} />
              </FormField>
              <FormField label={t('croissant.forms.prefs.hours')}>
                <Input {...prefsForm.register('hours')} />
              </FormField>
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  {t('croissant.forms.prefs.notifications')}
                </p>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>{t('croissant.forms.prefs.notifyOrders')}</span>
                  <Switch {...prefsForm.register('notifyOrders')} />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>{t('croissant.forms.prefs.notifyRefunds')}</span>
                  <Switch {...prefsForm.register('notifyRefunds')} />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>{t('croissant.forms.prefs.notifyLowStock')}</span>
                  <Switch {...prefsForm.register('notifyLowStock')} />
                </label>
              </div>
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  {t('croissant.forms.prefs.schedule')}
                </p>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>{t('croissant.forms.prefs.closedSundays')}</span>
                  <Switch {...prefsForm.register('closedSundays')} />
                </label>
              </div>
            </form>
          </DrawerBody>
          <DrawerFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPrefsOpen(false)}>
              {t('croissant.forms.prefs.cancel')}
            </Button>
            <Button variant="primary" onClick={() => void savePrefs()}>
              {t('croissant.forms.prefs.save')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
