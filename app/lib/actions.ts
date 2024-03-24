"use server";

import Subnet from "@/model/subnet";
import axios from "axios";
import { Collection, ObjectId } from "mongodb";
import { Block, createPublicClient, http, PublicClient } from "viem";
import clientPromise from "./mongodb";

export async function getLatestBlocks(subnet: Subnet): Promise<Block[]> {
  console.log("getData()");
  const publicClient = getPublicClient(subnet);
  const latestBlockNumber = await publicClient.getBlockNumber();
  const latestBlocks: Block[] = [];
  for (let i = 0; i < 5; i++) {
    const block = await publicClient.getBlock({
      blockNumber: latestBlockNumber - BigInt(i),
    });
    latestBlocks.push(block);
  }
  return latestBlocks;
}

export async function getLastSubnet(): Promise<Subnet | null> {
  console.log("getLastSubnet()");
  let subnet: Subnet | null = null;
  try {
    subnet = await findLastNotDeletedModel();
  } catch (error: any) {
    console.error(error);
  }
  return subnet ? JSON.parse(JSON.stringify(subnet)) : null;
}

/**
 * Deploy server with subnet to Vultr.
 */
export async function deploySubnet(label: string) {
  console.log("deploySubnet()");
  try {
    // Send request to deploy subnet server to Vultr
    const { data } = await axios.post(
      `https://api.vultr.com/v2/instances`,
      {
        region: "fra",
        plan: "vc2-1c-2gb",
        snapshot_id: "10aadb64-7f42-492e-80f9-5f4f0d08173e",
        label: "IPC Server",
      },
      {
        headers: { Authorization: `Bearer ${process.env.VULTR_API_KEY}` },
      }
    );
    // Create subnet in database
    const subnet = new Subnet(
      "DEPLOYING",
      new Date(),
      label,
      {
        id: data?.instance?.id,
        ip: undefined,
        username: "root",
        password: data?.instance?.default_password,
      },
      {
        ethApiHost: undefined,
        ethApiPort: "8545",
        chainId: "2194144149880582",
      },
      {
        address: "0xa0cbc2463b7f6149701b7cd4919190686cd55cd1",
        publicKey:
          "047829f263908006c0638331fee54622796c805319f10853eae0e9baa0d93e9e5911d689b467acedfbfb2503b2092dbf3e5a450061885859da35a56cb78236fd8c",
        privateKey:
          "3d47e22e73f6406804087d082fc28c279785937ca49213db8581ecb9ad0afa38",
      },
      [{ ip: undefined, owner: "0xa0cbc2463b7f6149701b7cd4919190686cd55cd1" }]
    );
    await insertModel(subnet);
  } catch (error: any) {
    console.error(error);
  }
}

export async function deleteSubnet(subnet: Subnet) {
  console.log("deleteSubnet()");
  try {
    // Send request to delete subnet server to Vultr
    const { data } = await axios.delete(
      `https://api.vultr.com/v2/instances/${subnet.server?.id}`,

      {
        headers: { Authorization: `Bearer ${process.env.VULTR_API_KEY}` },
      }
    );
    // Delete subnet in database
    await updateModel(subnet, { status: "DELETED" });
  } catch (error: any) {
    console.error(error);
  }
}

/**
 * Process subnet depending on its status.
 */
export async function handleSubnet(_id: string) {
  console.log("handleSubnet()");
  const subnet = await findModel(_id);
  if (subnet?.status === "DEPLOYING") {
    handleDeployingSubnet(subnet);
  }
  if (subnet?.status === "LAUNCHING") {
    handleLaunchingSubnet(subnet);
  }
}

/**
 * Try to define server IP using Vultr API if server is deployed.
 */
async function handleDeployingSubnet(subnet: Subnet) {
  console.log("handleDeployingSubnet");
  try {
    const { data } = await axios.get(
      `https://api.vultr.com/v2/instances/${subnet.server?.id}`,
      { headers: { Authorization: `Bearer ${process.env.VULTR_API_KEY}` } }
    );
    if (
      data?.instance?.status === "active" &&
      data?.instance?.server_status === "ok"
    ) {
      updateModel(subnet, {
        status: "LAUNCHING",
        "server.ip": data?.instance?.main_ip,
      });
    }
  } catch (error: any) {
    console.error(error);
  }
}

/**
 * Check if subnet is running.
 */
async function handleLaunchingSubnet(subnet: Subnet) {
  console.log("handleLaunchingSubnet()");
  try {
    const latestBlockNumber = await getPublicClient(subnet).getBlockNumber();
    if (latestBlockNumber > 0) {
      updateModel(subnet, { status: "RUNNING" });
    }
  } catch (error: any) {
    console.error(error);
  }
}

function getPublicClient(subnet: Subnet): PublicClient {
  return createPublicClient({
    chain: {
      id: Number(subnet.network?.chainId!),
      name: subnet.label!,
      nativeCurrency: {
        decimals: 18,
        name: "tFIL",
        symbol: "tFIL",
      },
      rpcUrls: {
        default: {
          http: [`http://${subnet.server?.ip}:${subnet.network?.ethApiPort}`],
        },
      },
    },
    transport: http(),
  });
}

async function findModel(_id: string): Promise<Subnet | null> {
  const collection = await getCollection();
  return await collection.findOne({ _id: new ObjectId(_id) });
}

async function findLastNotDeletedModel(): Promise<Subnet | null> {
  const collection = await getCollection();
  return await collection.findOne(
    { status: { $ne: "DELETED" } },
    { sort: { createdTime: -1 } }
  );
}

async function insertModel(subnet: Subnet) {
  const collection = await getCollection();
  await collection.insertOne(subnet);
}

async function updateModel(subnet: Subnet, newValues: any) {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: new ObjectId(subnet._id) },
    {
      $set: {
        ...newValues,
      },
    }
  );
}

async function getCollection(): Promise<Collection<Subnet>> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE as string);
  return db.collection<Subnet>(
    process.env.MONGODB_COLLECTION_SUBNETS as string
  );
}
