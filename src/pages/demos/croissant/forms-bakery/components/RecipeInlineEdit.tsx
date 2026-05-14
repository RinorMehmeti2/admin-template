import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Card, CardContent } from '@/components/data-display/Card';
import { FormField, Input, TagInput, useForm } from '@/components/forms';
import { SlideInDown } from '@/components/motion';
import { Controller } from 'react-hook-form';

interface Recipe {
  title: string;
  ingredients: string[];
}

const SEED: Recipe = {
  title: 'Classic butter croissant',
  ingredients: ['Flour', 'Butter', 'Yeast', 'Sugar', 'Salt', 'Water'],
};

export function RecipeInlineEdit() {
  const { t } = useTranslation();
  const [recipe, setRecipe] = useState<Recipe>(SEED);
  const [editing, setEditing] = useState(false);
  const form = useForm<Recipe>({ defaultValues: SEED });

  const startEdit = () => {
    form.reset(recipe);
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
  };
  const save = form.handleSubmit((values) => {
    setRecipe(values);
    setEditing(false);
  });

  return (
    <Card variant="outlined">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {t('croissant.forms.recipe.title')}
          </h3>
          {!editing ? (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={startEdit}
            >
              {t('croissant.forms.recipe.edit')}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" leftIcon={<X className="h-4 w-4" />} onClick={cancel}>
                {t('croissant.forms.recipe.cancel')}
              </Button>
              <Button size="sm" leftIcon={<Save className="h-4 w-4" />} onClick={() => void save()}>
                {t('croissant.forms.recipe.save')}
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <SlideInDown>
            <div className="space-y-3">
              <FormField label={t('croissant.forms.recipe.recipeName')}>
                <Input {...form.register('title')} />
              </FormField>
              <FormField label={t('croissant.forms.recipe.ingredients')}>
                <Controller
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <TagInput<string>
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('croissant.forms.recipe.ingredientsPh')}
                    />
                  )}
                />
              </FormField>
            </div>
          </SlideInDown>
        ) : (
          <div className="space-y-2">
            <p className="text-base font-medium text-foreground">{recipe.title}</p>
            <ul className="flex flex-wrap gap-1.5">
              {recipe.ingredients.map((ing) => (
                <li key={ing}>
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-foreground-muted">
                    {ing}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
