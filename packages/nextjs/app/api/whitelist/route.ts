// app/api/whitelist/route.ts
import { NextResponse } from "next/server";
import scaffoldConfig from "~~/scaffold.config";
import { adminClients, dataContracts } from "~~/utils/admin";

type WhitelistRequest = {
  publicKey: string;
};

export async function POST(request: Request) {
  const { publicKey } = (await request.json()) as WhitelistRequest;

  console.log("Adding, ", publicKey, ": To Whitelist");

  try {
    // Assuming you want to use the first target network specified in the config
    const targetNetwork = scaffoldConfig.targetNetworks[0];
    const adminClient = adminClients[targetNetwork.id];
    const dataContract = dataContracts[targetNetwork.id];

    // Call the updateWhitelist function on the DataContract
    await adminClient.writeContract({
      address: dataContract.address,
      abi: dataContract.abi,
      functionName: "updateWhitelist",
      args: [publicKey, true],
    });

    return NextResponse.json({ message: "Public key whitelisted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error whitelisting public key:", error);
    return NextResponse.json({ message: "Error whitelisting public key" }, { status: 500 });
  }
}
