"use server";

import Subnet from "@/model/subnet";
import axios from "axios";
import { Collection, ObjectId } from "mongodb";
import { Client } from "ssh2";
import { Block, createPublicClient, http } from "viem";
import clientPromise from "./mongodb";

const COMMAND_LAUCNH_SUBNET =
  "screen -d -m bash -c 'cd /root/ipc/; /root/.cargo/bin/cargo make --makefile infra/fendermint/Makefile.toml -e NODE_NAME=validator-1 -e PRIVATE_KEY_PATH=/root/.ipc/validator_1.sk -e SUBNET_ID=/r314159/t410fop6ro6vv7ikt77stuycnqhuhrpsmpfhrsmm25yq -e CMT_P2P_HOST_PORT=26656 -e CMT_RPC_HOST_PORT=26657 -e ETHAPI_HOST_PORT=8545 -e RESOLVER_HOST_PORT=26655 -e PARENT_GATEWAY=`curl -s https://raw.githubusercontent.com/consensus-shipyard/ipc/cd/contracts/deployments/r314159.json | jq -r '.gateway_addr'` -e PARENT_REGISTRY=`curl -s https://raw.githubusercontent.com/consensus-shipyard/ipc/cd/contracts/deployments/r314159.json | jq -r '.registry_addr'` -e FM_PULL_SKIP=1 child-validator; exec sh'; echo ok";
const COMMAND_LIST_DOCKER_CONTAINERS =
  "docker ps --format='{{json .}}' | jq . -s";

export async function getLatestBlocks(subnet: Subnet): Promise<Block[]> {
  console.log("getData()");
  const publicClient = createPublicClient({
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
        snapshot_id: "3782bddc-9f1a-4949-8eee-a5e02ceaf519",
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

/**
 * Process subnet depending on its status.
 */
export async function handleSubnet(_id: string) {
  console.log("handleSubnet()");
  const subnet = await findModel(_id);
  if (subnet?.status === "DEPLOYING") {
    handleDeployingSubnet(subnet);
  }
  if (subnet?.status === "DEPLOYED") {
    handleDeployedSubnet(subnet);
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
        status: "DEPLOYED",
        "server.ip": data?.instance?.main_ip,
      });
    }
  } catch (error: any) {
    console.error(error);
  }
}

/**
 * Try to launch deployed subnet.
 */
async function handleDeployedSubnet(subnet: Subnet) {
  console.log("handleDeployedSubnet()");
  const client = new Client();
  client
    .on("ready", () => {
      console.log("Client ready");
      client.exec(COMMAND_LAUCNH_SUBNET, (err, stream) => {
        if (err) throw err;
        stream
          .on("close", (code: any, signal: any) => {
            console.log("Stream close code: " + code + ", signal: " + signal);
            client.end();
          })
          .on("data", (data: any) => {
            console.log("STDOUT: " + data);
            updateModel(subnet, { status: "LAUNCHING" });
          })
          .stderr.on("data", (data) => {
            console.log("STDERR: " + data);
          });
      });
    })
    .connect({
      host: subnet.server?.ip,
      port: 22,
      username: subnet.server?.username,
      password: subnet.server?.password,
    });
}

/**
 * Check if docker containers are running.
 */
async function handleLaunchingSubnet(subnet: Subnet) {
  console.log("handleLaunchingSubnet()");
  const client = new Client();
  client
    .on("ready", () => {
      console.log("Client ready");
      client.exec(COMMAND_LIST_DOCKER_CONTAINERS, (err, stream) => {
        if (err) throw err;
        stream
          .on("close", (code: any, signal: any) => {
            console.log("Stream close code: " + code + ", signal: " + signal);
            client.end();
          })
          .on("data", (data: any) => {
            console.log("STDOUT: " + data);
            const containers = JSON.parse(data);
            if (
              containers[0].Names === "validator-1-ethapi" &&
              containers[0].State === "running" &&
              containers[1].Names === "validator-1-cometbft" &&
              containers[1].State === "running" &&
              containers[2].Names === "validator-1-fendermint" &&
              containers[2].State === "running"
            ) {
              updateModel(subnet, { status: "RUNNING" });
            }
          })
          .stderr.on("data", (data) => {
            console.log("STDERR: " + data);
          });
      });
    })
    .connect({
      host: subnet.server?.ip,
      port: 22,
      username: subnet.server?.username,
      password: subnet.server?.password,
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
