"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Bold, Italic, Underline, ArrowRight, Plus, ChevronDown } from "@/components/ui/icon"

import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Demo } from "./section"
import type { GalleryCluster } from "@/lib/gallery-types"

const schema = z.object({
  username: z.string().min(2, "At least 2 characters."),
  email: z.string().email("Enter a valid email."),
})

function ProfileForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "" },
  })

  function onSubmit(values: z.infer<typeof schema>) {
    toast.success("Submitted", { description: JSON.stringify(values) })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-5"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="sasha" {...field} />
              </FormControl>
              <FormDescription>Your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save changes</Button>
      </form>
    </Form>
  )
}

function ButtonCluster() {
  return (
    <>
      <Demo className="flex-col items-start gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" variant="outline" aria-label="Add item">
            <Plus />
          </Button>
          <Button disabled>Disabled</Button>
          <Button>
            With icon <ArrowRight />
          </Button>
        </div>
      </Demo>
    </>
  )
}

function ToggleCluster() {
  return (
    <>
      <Demo className="gap-8">
        <div className="flex items-center gap-2">
          <Toggle aria-label="Bold" defaultPressed>
            <Bold />
          </Toggle>
          <Toggle aria-label="Italic">
            <Italic />
          </Toggle>
          <Toggle aria-label="Underline">
            <Underline />
          </Toggle>
        </div>
        <ToggleGroup defaultValue={["left"]} variant="outline">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </Demo>
    </>
  )
}

function InputCluster() {
  return (
    <>
      <Demo className="flex-col items-stretch gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select>
              <SelectTrigger id="role">
                <SelectValue placeholder="Engineer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eng">Engineer</SelectItem>
                <SelectItem value="design">Designer</SelectItem>
                <SelectItem value="pm">Product</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="msg">Message</Label>
            <Textarea id="msg" placeholder="Tell us what you're building…" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Label className="flex items-center gap-2">
            <Checkbox defaultChecked /> Subscribe to updates
          </Label>
          <Label className="flex items-center gap-2">
            <Switch defaultChecked /> Notifications
          </Label>
        </div>
      </Demo>
    </>
  )
}

function RadioGroupCluster() {
  return (
    <>
      <Demo>
        <RadioGroup defaultValue="comfortable" className="gap-3">
          <Label className="flex items-center gap-2 font-normal">
            <RadioGroupItem value="default" /> Default
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <RadioGroupItem value="comfortable" /> Comfortable
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <RadioGroupItem value="compact" /> Compact
          </Label>
        </RadioGroup>
      </Demo>
    </>
  )
}

function SliderCluster() {
  const [slider, setSlider] = React.useState([64])

  return (
    <>
      <Demo className="flex-col items-start gap-7">
        <div className="w-full max-w-xs">
          <div className="mb-3 text-sm font-medium">
            Value <span className="font-mono text-muted-foreground">{slider[0]}</span>
          </div>
          <Slider
            value={slider}
            onValueChange={(value) => setSlider(Array.isArray(value) ? [...value] : [value])}
            max={100}
            step={1}
          />
        </div>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </Demo>
    </>
  )
}

function FormCluster() {
  return (
    <>
      <Demo>
        <ProfileForm />
      </Demo>
    </>
  )
}

function FieldCluster() {
  return (
    <>
      <Demo>
        <FieldGroup className="max-w-sm">
          <Field>
            <FieldLabel htmlFor="field-demo-counterparty">Counterparty</FieldLabel>
            <Input id="field-demo-counterparty" defaultValue="Harlan Grain Co." />
            <FieldDescription>
              The buyer on the contract. Must be an approved counterparty.
            </FieldDescription>
          </Field>

          <Field data-invalid>
            <FieldLabel htmlFor="field-demo-bushels">Contracted bushels</FieldLabel>
            <Input id="field-demo-bushels" defaultValue="0" aria-invalid />
            <FieldError errors={[{ message: "Enter a quantity above zero." }]} />
          </Field>

          <FieldSeparator>then</FieldSeparator>

          <Field orientation="horizontal">
            <Checkbox id="field-demo-hedge" defaultChecked />
            <FieldContent>
              <FieldLabel htmlFor="field-demo-hedge">Hedge on execution</FieldLabel>
              <FieldDescription>Place the offsetting futures order at signing.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </Demo>
    </>
  )
}

function NativeSelectCluster() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Demo className="items-start">
          <NativeSelect defaultValue="tonnes" aria-label="Unit of measure">
            <NativeSelectOptGroup label="Weight">
              <NativeSelectOption value="tonnes">Metric tonnes</NativeSelectOption>
              <NativeSelectOption value="cwt">Hundredweight</NativeSelectOption>
            </NativeSelectOptGroup>
            <NativeSelectOptGroup label="Volume">
              <NativeSelectOption value="bushels">Bushels</NativeSelectOption>
            </NativeSelectOptGroup>
          </NativeSelect>
        </Demo>
        <Demo className="items-start">
          <NativeSelect size="sm" defaultValue="fob" disabled aria-label="Delivery terms">
            <NativeSelectOption value="fob">FOB origin</NativeSelectOption>
            <NativeSelectOption value="cif">CIF destination</NativeSelectOption>
          </NativeSelect>
        </Demo>
      </div>
    </>
  )
}

function ButtonGroupCluster() {
  return (
    <>
      <div className="flex flex-wrap items-start gap-4">
        <Demo className="items-start">
          <ButtonGroup>
            <Button variant="outline">Approve load</Button>
            <Button variant="outline" size="icon" aria-label="More approval actions">
              <ChevronDown />
            </Button>
          </ButtonGroup>
        </Demo>
        <Demo className="items-start">
          <ButtonGroup>
            <Button variant="outline">Day</Button>
            <Button variant="outline">Week</Button>
            <Button variant="outline">Month</Button>
          </ButtonGroup>
        </Demo>
        <Demo className="items-start">
          <ButtonGroup>
            <ButtonGroupText>Basis</ButtonGroupText>
            <Input defaultValue="-0.35" className="w-24" aria-label="Basis" />
            <ButtonGroupText>/ bu</ButtonGroupText>
          </ButtonGroup>
        </Demo>
      </div>
    </>
  )
}

export const formsClusters: GalleryCluster[] = [
  { anchor: "c-button", slug: "button", title: "Button", group: "Actions", demo: ButtonCluster },
  { anchor: "c-button-group", slug: "button-group", title: "Button group", group: "Actions", demo: ButtonGroupCluster },
  { anchor: "c-toggle", slug: "toggle", title: "Toggle · Toggle group", group: "Actions", demo: ToggleCluster },
  { anchor: "c-input", slug: "input", title: "Input · Select · Textarea", group: "Forms & input", demo: InputCluster },
  { anchor: "c-field", slug: "field", title: "Field", group: "Forms & input", demo: FieldCluster },
  { anchor: "c-native-select", slug: "native-select", title: "Native select", group: "Forms & input", demo: NativeSelectCluster },
  { anchor: "c-radio-group", slug: "radio-group", title: "Radio group", group: "Forms & input", demo: RadioGroupCluster },
  { anchor: "c-slider", slug: "slider", title: "Slider · Input OTP", group: "Forms & input", demo: SliderCluster },
  { anchor: "c-form", slug: "form", title: "Form (react-hook-form + zod)", group: "Forms & input", demo: FormCluster },
]
