"use client";

import useError from "@/hooks/useError";
import { getLastSubnet } from "@/lib/actions";
import Subnet from "@/model/subnet";
import { useEffect, useState } from "react";
import { SubnetCard } from "./subnet-card";
import { SubnetDeployForm } from "./subnet-deploy-form";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { toast } from "./ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal, TriangleAlert } from "lucide-react";

export function Dashboard() {
  const { handleError } = useError();
  const [subnet, setSubnet] = useState<Subnet | null>();

  function loadSubnet() {
    console.log("loadSubnet()");
    getLastSubnet()
      .then((subnet) => setSubnet(subnet))
      .catch((error) => handleError(error, true));
  }

  useEffect(() => {
    loadSubnet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (subnet === undefined) {
    return <Skeleton className="w-full h-[20px] rounded-full" />;
  } else if (subnet?.status === "RUNNING") {
    return (
      <DashboardSubnetDeployed
        subnet={subnet}
        onSubnetUpdate={() => loadSubnet()}
      />
    );
  } else {
    return (
      <DashboardSubnetNotDeployed
        subnet={subnet}
        reloadSubnet={() => loadSubnet()}
      />
    );
  }
}

export function DashboardSubnetDeployed(props: {
  subnet: Subnet;
  onSubnetUpdate: () => void;
}) {
  return (
    <>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Manage your IPC subnet</p>
      </div>
      <Alert className="mt-6">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Dear testers!</AlertTitle>
        <AlertDescription>
          For development purposes, subnets may be deleted after some time.
        </AlertDescription>
      </Alert>
      <Separator className="my-6" />
      <div className="flex flex-col items-start gap-4">
        <Button
          onClick={() =>
            toast({
              title: "Not implemented yet ☹️",
              description:
                "The platform supports only one active subnet at a time",
            })
          }
        >
          Deploy New Subnet
        </Button>
        <SubnetCard
          subnet={props.subnet}
          onSubnetUpdate={props.onSubnetUpdate}
        />
      </div>
    </>
  );
}

export function DashboardSubnetNotDeployed(props: {
  subnet: Subnet | null;
  reloadSubnet: () => void;
}) {
  return (
    <>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Deploy your first IPC subnet</p>
      </div>
      <Alert className="mt-6">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Dear testers!</AlertTitle>
        <AlertDescription>
          For development purposes, subnets may be deleted after some time.
        </AlertDescription>
      </Alert>
      <Separator className="my-6" />
      <SubnetDeployForm
        subnet={props.subnet}
        reloadSubnet={props.reloadSubnet}
      />
    </>
  );
}
