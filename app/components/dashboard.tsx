"use client";

import { Subnet } from "./subnet";
import { SubnetDeployForm } from "./subnet-deploy-form";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { toast } from "./ui/use-toast";

export function Dashboard() {
  const subnet = undefined; // TODO: Load subnet from database

  return subnet ? (
    <DashboardSubnetDeployed subnet={subnet} />
  ) : (
    <DashboardSubnetNotDeployed />
  );
}

// TODO: Use type for subnet
export function DashboardSubnetDeployed(props: { subnet: any }) {
  return (
    <>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Manage your IPC subnet</p>
      </div>
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
          Deploy
        </Button>
        <Subnet />
      </div>
    </>
  );
}

export function DashboardSubnetNotDeployed() {
  return (
    <>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Deploy your first IPC subnet</p>
      </div>
      <Separator className="my-6" />
      <SubnetDeployForm />
    </>
  );
}
