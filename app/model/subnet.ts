import { ObjectId } from "mongodb";

/**
 * Class for MongoDB data model.
 */
export default class Subnet {
  constructor(
    public status: "NONE" | "DEPLOYING" | "LAUNCHING" | "RUNNING" | "DELETED",
    public createdTime: Date,
    public label: string | undefined,
    public server:
      | {
          id: string | undefined;
          ip: string | undefined;
          username: string | undefined;
          password: string | undefined;
        }
      | undefined,
    public network:
      | {
          ethApiHost: string | undefined;
          ethApiPort: string | undefined;
          chainId: string | undefined;
        }
      | undefined,
    public creator:
      | {
          address: string | undefined;
          publicKey: string | undefined;
          privateKey: string | undefined;
        }
      | undefined,
    public validators:
      | {
          ip: string | undefined;
          owner: string | undefined;
        }[]
      | undefined,
    public _id?: ObjectId
  ) {}
}
