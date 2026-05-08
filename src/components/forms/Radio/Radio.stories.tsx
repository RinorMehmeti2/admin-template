import { Radio } from './Radio';
import { RadioGroup } from '@/components/forms/RadioGroup';

export default { title: 'Forms/Radio', component: Radio };

export const Standalone = {
  render: () => <Radio name="example" value="a" defaultChecked>Alpha</Radio>,
};

export const InGroup = {
  render: () => (
    <RadioGroup name="story-group" defaultValue="b" aria-label="Choose">
      <Radio value="a">Alpha</Radio>
      <Radio value="b">Beta</Radio>
      <Radio value="c">Gamma</Radio>
    </RadioGroup>
  ),
};
