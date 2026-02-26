import * as React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

type Props = {
  field: any
  whitelistedEmails: string[]
}

export function WhitelistedEmailSelect({ field, whitelistedEmails }: Props) {
  const emailOptions = Array.from(
    new Set([field.value, ...whitelistedEmails])
  ).filter((email): email is string => Boolean(email))

  return (
    <Select key={field.value} onValueChange={field.onChange} value={field.value}>
      <SelectTrigger>
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        {emailOptions.map((email) => {
          const isWhitelisted = whitelistedEmails.includes(email)

          return (
            <SelectItem key={email} value={email}>
              {email}
              {!isWhitelisted && " (unwhitelisted)"}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}