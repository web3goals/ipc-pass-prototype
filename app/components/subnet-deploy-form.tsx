"use client";

import useError from "@/hooks/useError";
import { deploySubnet, handleSubnet } from "@/lib/actions";
import { cn } from "@/lib/utils";
import Subnet from "@/model/subnet";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClassValue } from "clsx";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

export function SubnetDeployForm(props: {
  subnet: Subnet | null;
  reloadSubnet: () => void;
  className?: ClassValue;
}) {
  const { handleError } = useError();
  const [isFormSubmitting, setIsFormSubmitting] = useState(
    Boolean(props.subnet)
  );

  const formSchema = z.object({
    label: z.string().min(2),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsFormSubmitting(true);
      if (props.subnet) {
        throw new Error("Subnet is not null");
      }
      await deploySubnet(values.label);
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("reloadSubnet()");
      props.reloadSubnet();
    }, 30 * 1000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const intervalCallback = () => {
      if (props.subnet?._id) {
        console.log("handleSubnet()");
        handleSubnet(props.subnet._id.toString());
      }
    };
    const clearAndSetInterval = () => {
      clearInterval(intervalId);
      intervalId = setInterval(intervalCallback, 60 * 1000);
    };
    clearAndSetInterval();
    return () => clearInterval(intervalId);
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
          <div className="flex flex-row items-center gap-4">
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
