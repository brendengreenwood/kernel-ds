import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "kernel-portal"

export function Canonical() {
  return (
    <Accordion
      defaultValue={["a1"]}
      style={{
        width: 380,
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--card)",
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <AccordionItem value="a1">
        <AccordionTrigger>What moves my posted basis?</AccordionTrigger>
        <AccordionContent>
          Basis follows local demand, freight spreads, and elevator space. We
          re-post whenever the river terminal updates its bid.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="a2">
        <AccordionTrigger>When do settlements pay out?</AccordionTrigger>
        <AccordionContent>
          Settlements post the business day after grading and pay by ACH within
          two days.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="a3">
        <AccordionTrigger>How are moisture discounts applied?</AccordionTrigger>
        <AccordionContent>
          Corn over 15.0% moisture takes the posted drying schedule, deducted on
          the settlement sheet per load.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function MultipleOpen() {
  return (
    <Accordion
      defaultValue={["q1", "q2"]}
      style={{
        width: 380,
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--card)",
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <AccordionItem value="q1">
        <AccordionTrigger>Delivery windows</AccordionTrigger>
        <AccordionContent>
          October 1 – November 15 for fall corn; rolling windows for stored
          bushels.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="q2">
        <AccordionTrigger>Storage rates</AccordionTrigger>
        <AccordionContent>
          4¢/bu per month after the first 90 free days, billed against the
          settlement.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
