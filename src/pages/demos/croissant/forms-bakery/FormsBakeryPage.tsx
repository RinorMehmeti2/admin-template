import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
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
import { Chip, ComponentsUsedFooter, SceneHeader, StagedSection } from '../_shared';
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

const COMPONENTS = [
  'SceneHeader',
  'StagedSection',
  'Chip',
  'Form',
  'FormField',
  'Input',
  'Textarea',
  'NumberInput',
  'Select',
  'Switch',
  'TagInput',
  'Radio',
  'RadioGroup',
  'FormWizard',
  'FormWizardStep',
  'Drawer',
  'Card',
  'Button',
  'IconButton',
  'Badge',
  'Toast',
  'BounceIn',
  'SlideInRight',
  'SlideInDown',
  'Wiggle',
];

export function FormsBakeryPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const prefsForm = useForm<Preferences>({ defaultValues: PREF_DEFAULTS });

  const meta = (
    <>
      <Chip tone="info" dot>
        {t('croissant.forms.meta.workflows', { n: 3 })}
      </Chip>
      <Chip tone="primary">{t('croissant.forms.meta.live')}</Chip>
    </>
  );

  const savePrefs = prefsForm.handleSubmit((values) => {
    toast.success(t('croissant.forms.prefs.saved'), {
      description: t('croissant.forms.prefs.savedDesc', { name: values.bakeryName }),
    });
    setPrefsOpen(false);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      <SceneHeader
        tone="info"
        pattern="dots"
        eyebrow={t('croissant.forms.scene.eyebrow')}
        title={t('croissant.forms.scene.title')}
        description={t('croissant.forms.scene.description')}
        meta={meta}
      />

      <div className="flex flex-wrap items-center justify-end gap-2" data-print="hide">
        <Button
          variant="outline"
          leftIcon={<Settings className="h-4 w-4" />}
          onClick={() => setPrefsOpen(true)}
        >
          {t('croissant.forms.prefs.open')}
        </Button>
      </div>

      <StagedSection
        tone="info"
        eyebrow={t('croissant.forms.section.quickEyebrow')}
        title={t('croissant.forms.section.quick')}
        description={t('croissant.forms.section.quickDesc')}
        headingId="forms-quick"
      >
        <QuickOrderForm />
      </StagedSection>

      <StagedSection
        tone="info"
        eyebrow={t('croissant.forms.section.wholesaleEyebrow')}
        title={t('croissant.forms.section.wholesale')}
        description={t('croissant.forms.section.wholesaleDesc')}
        headingId="forms-wholesale"
      >
        <WholesaleWizard />
      </StagedSection>

      <StagedSection
        tone="info"
        eyebrow={t('croissant.forms.section.recipeEyebrow')}
        title={t('croissant.forms.section.recipe')}
        description={t('croissant.forms.section.recipeDesc')}
        headingId="forms-recipe"
      >
        <RecipeInlineEdit />
      </StagedSection>

      <StagedSection
        tone="info"
        eyebrow={t('croissant.forms.section.validateEyebrow')}
        title={t('croissant.forms.section.validate')}
        description={t('croissant.forms.section.validateDesc')}
        headingId="forms-validate"
      >
        <ValidationPlayground />
      </StagedSection>

      <Drawer open={prefsOpen} onOpenChange={setPrefsOpen} side="right" responsive={false}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('croissant.forms.prefs.title')}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
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
          <DrawerFooter>
            <Button variant="ghost" onClick={() => setPrefsOpen(false)}>
              {t('croissant.forms.prefs.cancel')}
            </Button>
            <Button onClick={() => void savePrefs()}>{t('croissant.forms.prefs.save')}</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <ComponentsUsedFooter components={COMPONENTS} />
    </div>
  );
}
