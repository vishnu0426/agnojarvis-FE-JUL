/**
 * Multi-select language picker.
 *
 * - Searchable list (English + native names); unsupported options stay visible but disabled.
 * - Selected languages show as chips. The first chip is the PRIMARY language
 *   (the one the greeting and single-language providers use); click the star on
 *   another chip to make it primary.
 */

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { LanguageOption } from "@/lib/languages";

interface LanguageMultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  options: LanguageOption[];
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function LanguageMultiSelect({
  value,
  onChange,
  options,
  max = 20,
  placeholder = "Select languages",
  disabled = false,
  id,
}: LanguageMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const labelFor = useMemo(() => {
    const m = new Map(options.map((o) => [o.value, o.label]));
    return (code: string) => m.get(code) ?? code;
  }, [options]);

  const toggle = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((v) => v !== code));
    } else if (value.length < max) {
      onChange([...value, code]);
    }
  };

  const makePrimary = (code: string) => onChange([code, ...value.filter((v) => v !== code)]);

  const enabled = options.filter((o) => !o.disabled);
  const disabledOptions = options.filter((o) => o.disabled);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className={cn(value.length === 0 && "text-muted-foreground")}>
              {value.length === 0
                ? placeholder
                : `${value.length} language${value.length === 1 ? "" : "s"} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search languages..." />
            <CommandList className="max-h-72">
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup heading={disabledOptions.length > 0 ? "Supported" : undefined}>
                {enabled.map((o) => {
                  const selected = value.includes(o.value);
                  return (
                    <CommandItem
                      key={o.value}
                      value={`${o.label} ${o.hint ?? ""} ${o.value}`}
                      onSelect={() => toggle(o.value)}
                      disabled={!selected && value.length >= max}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                      <span className="flex-1">{o.label}</span>
                      {o.hint && o.hint !== o.label && (
                        <span className="ml-2 text-xs text-muted-foreground">{o.hint}</span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {disabledOptions.length > 0 && (
                <CommandGroup heading={disabledOptions[0].reason ?? "Not supported"}>
                  {disabledOptions.map((o) => (
                    <CommandItem
                      key={`x-${o.value}`}
                      value={`${o.label} ${o.hint ?? ""} ${o.value}`}
                      disabled
                      className="opacity-50"
                    >
                      <span className="mr-2 h-4 w-4" />
                      <span className="flex-1">{o.label}</span>
                      {o.hint && o.hint !== o.label && (
                        <span className="ml-2 text-xs text-muted-foreground">{o.hint}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((code, i) => (
            <Badge key={code} variant={i === 0 ? "default" : "secondary"} className="gap-1 pr-1">
              {i > 0 && (
                <button
                  type="button"
                  aria-label={`Make ${labelFor(code)} the primary language`}
                  title="Make primary"
                  onClick={() => makePrimary(code)}
                  disabled={disabled}
                  className="rounded-sm p-0.5 hover:bg-background/40"
                >
                  <Star className="h-3 w-3" />
                </button>
              )}
              {i === 0 && <Star className="h-3 w-3 fill-current" aria-label="Primary language" />}
              <span>{labelFor(code)}</span>
              <button
                type="button"
                aria-label={`Remove ${labelFor(code)}`}
                onClick={() => toggle(code)}
                disabled={disabled}
                className="rounded-sm p-0.5 hover:bg-background/40"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {value.length > 1 && (
        <p className="text-xs text-muted-foreground">
          The starred language is the primary one. Click a star to change it.
        </p>
      )}
    </div>
  );
}
