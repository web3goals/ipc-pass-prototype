import { ObjectId } from "mongodb";

/**
 * Class for MongoDB data model.
 */
export default class Subnet {
  constructor(
    public status:
      | "NONE"
      | "DEPLOYING"
      | "DEPLOYED"
      | "LAUNCHING"
      | "RUNNING"
      | "DELETED",
    public createdTime: Date,
    public label: string,
    public serverId: string | undefined,
    public serverIp: string | undefined,
    public serverUsername: string | undefined,
    public serverPassword: string | undefined,
    public _id?: ObjectId
  ) {}
}
