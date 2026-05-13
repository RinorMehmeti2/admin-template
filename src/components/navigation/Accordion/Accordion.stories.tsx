import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';

export default { title: 'Navigation/Accordion', component: Accordion };

const faq = [
  { q: 'How do I reset my password?', a: 'Go to settings → security → reset.' },
  { q: 'Where are billing receipts?', a: 'Billing → invoices. Download PDFs.' },
  { q: 'How to invite teammates?', a: 'Admin → members → invite by email.' },
  { q: 'Is data encrypted at rest?', a: 'Yes. AES-256, KMS-rotated.' },
];

export const Default = {
  render: () => (
    <div className="max-w-xl">
      <Accordion defaultValue="q-0">
        {faq.map((f, i) => (
          <AccordionItem key={f.q} value={`q-${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const Multiple = {
  render: () => (
    <div className="max-w-xl">
      <Accordion type="multiple" defaultValue={['q-0', 'q-2']}>
        {faq.map((f, i) => (
          <AccordionItem key={f.q} value={`q-${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const Bordered = {
  render: () => (
    <div className="max-w-xl">
      <Accordion variant="bordered">
        {faq.map((f, i) => (
          <AccordionItem key={f.q} value={`q-${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const Separated = {
  render: () => (
    <div className="max-w-xl">
      <Accordion variant="separated" type="multiple">
        {faq.map((f, i) => (
          <AccordionItem key={f.q} value={`q-${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const WithDisabled = {
  render: () => (
    <div className="max-w-xl">
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger>Available</AccordionTrigger>
          <AccordionContent>Open me.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b" disabled>
          <AccordionTrigger>Locked (disabled)</AccordionTrigger>
          <AccordionContent>Not reachable.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="c">
          <AccordionTrigger>Available too</AccordionTrigger>
          <AccordionContent>Open me also.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
