"use client";

import useError from "@/hooks/useError";
import {
  deploySubnet,
  handleSubnet as handleSubnetAction,
} from "@/lib/actions";
import { cn } from "@/lib/utils";
import Subnet from "@/model/subnet";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClassValue } from "clsx";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function SubnetDeployForm(props: {
  subnet: Subnet | null;
  reloadSubnet: () => void;
  className?: ClassValue;
}) {
  const { handleError } = useError();
  const [isFormSubmitting, setIsFormSubmitting] = useState(
    Boolean(props.subnet)
  );

  const formOptions = [
    {
      id: "domain_ssl",
      label: "Domain + SSL",
    },
    {
      id: "custom_syscalls",
      label: "Custom Syscalls",
    },
  ] as const;

  const formSchema = z.object({
    label: z.string().min(2),
    provider: z.string({ required_error: "Please select a provider" }),
    location: z.string({ required_error: "Please select a location" }),
    options: z.array(z.string()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      provider: undefined,
      location: undefined,
      options: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsFormSubmitting(true);
      if (props.subnet) {
        throw new Error("Subnet is not null");
      }
      await deploySubnet(values.label);
      props.reloadSubnet();
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  async function handleSubnet() {
    try {
      console.log(`handleSubnet(), subnet ID: ${props.subnet?._id}`);
      if (props.subnet?._id) {
        await handleSubnetAction(props.subnet._id.toString());
        props.reloadSubnet();
      }
    } catch (error: any) {
      handleError(error, true);
    }
  }

  useEffect(() => {
    // Handle subnet
    handleSubnet();
    // Run interval with function to handle subnet
    let intervalId: NodeJS.Timeout;
    const clearAndSetInterval = () => {
      clearInterval(intervalId);
      intervalId = setInterval(handleSubnet, 30 * 1000);
    };
    clearAndSetInterval();
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.subnet?._id]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("space-y-4", props.className)}
        >
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input
                    placeholder="X Network"
                    disabled={isFormSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isFormSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vultr">Vultr</SelectItem>
                    <SelectItem value="aws" disabled>
                      AWS
                    </SelectItem>
                    <SelectItem value="gc" disabled>
                      Google Cloud
                    </SelectItem>
                    <SelectItem value="ma" disabled>
                      Microsoft Azure
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isFormSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="frankfurt">Frankfurt</SelectItem>
                    <SelectItem value="amsterdam" disabled>
                      Amsterdam
                    </SelectItem>
                    <SelectItem value="atlanta" disabled>
                      Atlanta
                    </SelectItem>
                    <SelectItem value="mumbai" disabled>
                      Mumbai
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="options"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Options</FormLabel>
                </div>
                {formOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="options"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              disabled
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, option.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row items-center gap-4 pt-2">
            <Button disabled={isFormSubmitting}>
              {isFormSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deploying
                </>
              ) : (
                <>Deploy</>
              )}
            </Button>
            {isFormSubmitting && (
              <p className="text-sm text-muted-foreground">
                The process usually takes 5 minutes
              </p>
            )}
          </div>
        </form>
      </Form>
    </>
  );
}
