"use client";

import useError from "@/hooks/useError";
import { deploySubnet, handleSubnet } from "@/lib/actions";
import Subnet from "@/model/subnet";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function SubnetDeployForm(props: {
  subnet: Subnet | null;
  reloadSubnet: () => void;
}) {
  const { handleError } = useError();
  const [isFormSubmitting, setIsFormSubmitting] = useState(
    Boolean(props.subnet)
  );

  async function deploy() {
    try {
      setIsFormSubmitting(true);
      if (props.subnet) {
        throw new Error("Subnet is not null");
      }
      await deploySubnet();
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  /**
   *
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("reloadSubnet()");
      props.reloadSubnet();
    }, 60 * 1000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (props.subnet?._id) {
        console.log("handleSubnet()");
        handleSubnet(props.subnet._id.toString());
      }
    }, 60 * 1000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-row items-center gap-4">
        <Button onClick={() => deploy()} disabled={isFormSubmitting}>
          {isFormSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Deploy
        </Button>
        <p className="text-sm text-muted-foreground">
          Status: {props.subnet?.status}
        </p>
      </div>
    </>
  );
}
