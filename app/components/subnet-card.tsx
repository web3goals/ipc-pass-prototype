"use client";

import Subnet from "@/model/subnet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { addressToShortAddress } from "@/lib/converters";

export function SubnetCard(props: { subnet: Subnet }) {
  return (
    <div className="w-full flex flex-col items-center border rounded px-4 py-4">
      <SubnetCardDetails subnet={props.subnet} />
      <Separator className="my-4" />
      <SubnetCardCreator subnet={props.subnet} />
      <Separator className="my-4" />
      <SubnetCardValidators subnet={props.subnet} />
      <Separator className="my-4" />
      <SubnetCardBlocks subnet={props.subnet} />
    </div>
  );
}

function SubnetCardDetails(props: { subnet: Subnet }) {
  // TODO: Implement
  function AddToMetamaskButton() {
    return <Button variant="outline">Add to MetaMask</Button>;
  }

  // TODO: Implement
  function DeleteButton() {
    return <Button variant="destructive">Delete</Button>;
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
            <p className="min-w-[80px] text-sm text-muted-foreground">RPC:</p>
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
          <DeleteButton />
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
  // TODO: Implement
  function AddValidatorButton() {
    return <Button variant="outline">Add Validator</Button>;
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
  // TODO: Implement
  function OpenExplorerButton() {
    return <Button variant="outline">Open Explorer</Button>;
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
        <p className="text-base font-bold">Blocks</p>
        <p className="text-sm break-all mt-4">...</p>
        <div className="mt-6">
          <OpenExplorerButton />
        </div>
      </div>
    </div>
  );
}
