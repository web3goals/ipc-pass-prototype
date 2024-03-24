"use client";

import useError from "@/hooks/useError";
import { deleteSubnet, getLatestBlocks } from "@/lib/actions";
import { addressToShortAddress } from "@/lib/converters";
import Subnet from "@/model/subnet";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Block } from "viem";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { toast } from "./ui/use-toast";

export function SubnetCard(props: {
  subnet: Subnet;
  onSubnetUpdate: () => void;
}) {
  return (
    <div className="w-full flex flex-col items-center border rounded px-4 py-4">
      <SubnetCardDetails
        subnet={props.subnet}
        onSubnetUpdate={props.onSubnetUpdate}
      />
      <Separator className="my-4" />
      <SubnetCardCreator subnet={props.subnet} />
      <Separator className="my-4" />
      <SubnetCardValidators subnet={props.subnet} />
      <Separator className="my-4" />
      <SubnetCardBlocks subnet={props.subnet} />
    </div>
  );
}

function SubnetCardDetails(props: {
  subnet: Subnet;
  onSubnetUpdate: () => void;
}) {
  function AddToMetamaskButton() {
    return (
      <Link
        href="https://docs.ipc.space/development-guides/performing-transactions-in-a-subnet"
        target="_blank"
      >
        <Button variant="outline">Add to MetaMask</Button>
      </Link>
    );
  }

  function DeleteDialog() {
    const { handleError } = useError();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit() {
      try {
        setIsSubmitting(true);
        await deleteSubnet(props.subnet);
        props.onSubnetUpdate();
        setOpen(false);
      } catch (error: any) {
        handleError(error, true);
      } finally {
        setIsSubmitting(false);
      }
    }

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Subnet</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <Button disabled={isSubmitting} onClick={() => onSubmit()}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div className="w-full flex flex-row gap-5">
      {/* Icon */}
      <div>
        <Avatar className="size-16">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-3xl bg-slate-500">🌐</AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full">
        <p className="text-xl font-bold">{props.subnet.label}</p>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">
              Deployed:
            </p>
            <p className="text-sm break-all">
              {new Date(props.subnet.createdTime).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">
              RPC URL:
            </p>
            <p className="text-sm break-all">
              http://{props.subnet.server?.ip}:
              {props.subnet.network?.ethApiPort}
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">
              Chain ID:
            </p>
            <p className="text-sm break-all">{props.subnet.network?.chainId}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-6 md:flex-row">
          <AddToMetamaskButton />
          <DeleteDialog />
        </div>
      </div>
    </div>
  );
}

function SubnetCardCreator(props: { subnet: Subnet }) {
  return (
    <div className="w-full flex flex-row gap-4">
      {/* Icon */}
      <div>
        <Avatar className="size-12">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-base">🦄</AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full">
        <p className="text-base font-bold">Creator</p>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">
              Address:
            </p>
            <p className="text-sm break-all">{props.subnet.creator?.address}</p>
          </div>
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">
              Public key:
            </p>
            <p className="text-sm break-all">
              {props.subnet.creator?.publicKey}
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">
              Private key:
            </p>
            <p className="text-sm break-all blur-sm hover:blur-none">
              {props.subnet.creator?.privateKey}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubnetCardValidators(props: { subnet: Subnet }) {
  function AddValidatorButton() {
    return (
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Not implemented yet ☹️",
            description: "This feature will be released in the next version",
          })
        }
      >
        Add Validator
      </Button>
    );
  }

  return (
    <div className="w-full flex flex-row gap-4">
      {/* Icon */}
      <div>
        <Avatar className="size-12">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-base">👀</AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full">
        <p className="text-base font-bold">Validators</p>
        <div className="flex flex-col gap-2 mt-4">
          {props.subnet.validators?.map((validator, index) => (
            <div key={index} className="flex flex-col md:flex-row md:gap-4">
              <p className="text-sm text-muted-foreground">IP:</p>
              <p className="text-sm">{props.subnet.server?.ip}</p>
              <p className="text-sm text-muted-foreground">Owner:</p>
              <p className="text-sm break-all">
                {addressToShortAddress(validator.owner || "")}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <AddValidatorButton />
        </div>
      </div>
    </div>
  );
}

function SubnetCardBlocks(props: { subnet: Subnet }) {
  const { handleError } = useError();
  const [latestBlocks, setLatestBlocks] = useState<Block[] | undefined>();

  useEffect(() => {
    getLatestBlocks(props.subnet)
      .then((latestBlocks) => setLatestBlocks(latestBlocks))
      .catch((error) => handleError(error, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function BlockDialog(props: { block: Block }) {
    return (
      <Dialog>
        <DialogTrigger>
          <a
            className="text-sm font-medium underline underline-offset-4 cursor-pointer text-secondary-foreground"
            onClick={() => console.log("here")}
          >
            {props.block.number?.toString()}
          </a>
        </DialogTrigger>
        <DialogContent className="max-w-full">
          <DialogHeader>
            <DialogTitle>Block #{props.block.number?.toString()}</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <pre className="rounded bg-muted max-h-[480px] px-[1rem] py-[0.8rem] font-mono text-sm font-semibold break-all whitespace-pre-wrap overflow-y-scroll">
              {JSON.stringify(
                props.block,
                (key, value) =>
                  typeof value === "bigint" ? value.toString() : value,
                2
              )}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  function OpenExplorerButton() {
    return (
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Not implemented yet ☹️",
            description: "This feature will be released in the next version",
          })
        }
      >
        Open Explorer
      </Button>
    );
  }

  return (
    <div className="w-full flex flex-row gap-4">
      {/* Icon */}
      <div>
        <Avatar className="size-12">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-base">⛓️</AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full">
        <p className="text-base font-bold">Latest blocks</p>
        <div className="flex flex-col items-start gap-3 mt-4">
          {latestBlocks ? (
            <>
              {latestBlocks.map((block, index) => (
                <BlockDialog key={index} block={block} />
              ))}
            </>
          ) : (
            <>
              <Skeleton className="h-[20px]" />
              <Skeleton className="h-[20px]" />
              <Skeleton className="h-[20px]" />
            </>
          )}
        </div>

        <div className="mt-6">
          <OpenExplorerButton />
        </div>
      </div>
    </div>
  );
}
