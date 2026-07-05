import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "kernel-portal"

const schema = z.object({
  farm: z.string().min(2, "Farm name needs at least 2 characters."),
  email: z.string().email("Enter a valid email."),
})

type ContractValues = z.infer<typeof schema>

export function ContractForm() {
  const form = useForm<ContractValues>({
    resolver: zodResolver(schema),
    defaultValues: { farm: "Hartmann Farms", email: "" },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => undefined)}
        style={{ display: "grid", gap: 20, width: 320 }}
      >
        <FormField
          control={form.control}
          name="farm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farm name</FormLabel>
              <FormControl>
                <Input placeholder="Hartmann Farms" {...field} />
              </FormControl>
              <FormDescription>As it appears on the contract.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact email</FormLabel>
              <FormControl>
                <Input placeholder="dispatch@hartmannfarms.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button type="submit">Save contract</Button>
        </div>
      </form>
    </Form>
  )
}

export function ValidationErrors() {
  const form = useForm<ContractValues>({
    resolver: zodResolver(schema),
    defaultValues: { farm: "H", email: "not-an-email" },
  })

  React.useEffect(() => {
    void form.trigger()
  }, [form])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => undefined)}
        style={{ display: "grid", gap: 20, width: 320 }}
      >
        <FormField
          control={form.control}
          name="farm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farm name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button type="submit">Save contract</Button>
        </div>
      </form>
    </Form>
  )
}
