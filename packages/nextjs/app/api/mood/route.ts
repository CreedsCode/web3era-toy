// app/api/mood/route.ts
import { NextRequest, NextResponse } from "next/server";
import { secp256k1 } from "@noble/curves/secp256k1";
import { Hex, WriteContractReturnType, recoverTypedDataAddress } from "viem";
import scaffoldConfig from "~~/scaffold.config";
import { adminClients, dataContracts } from "~~/utils/admin";

// Helper function to convert hex to number
const hexToNumber = (hex: string): number => parseInt(hex, 16);

export async function POST(request: NextRequest) {
  const { metaTransaction, signature, chainId } = await request.json();

  try {
    const targetNetwork = scaffoldConfig.targetNetworks[0];
    const adminClient = adminClients[targetNetwork.id];
    const dataContract = dataContracts[targetNetwork.id];

    console.log("Verifying signature...");

    // Convert string representations back to BigInt
    const convertedMetaTransaction = {
      ...metaTransaction,
      nonce: BigInt(metaTransaction.nonce),
    };

    // Verify the signature
    console.log("==================", chainId);
    const signerAddress = await recoverTypedDataAddress({
      domain: {
        name: "DataContract",
        version: "1",
        chainId: BigInt(chainId),
        verifyingContract: dataContract.address,
      },
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        MetaTransactionStruct: [
          { name: "nonce", type: "uint256" },
          { name: "from", type: "address" },
          { name: "functionSignature", type: "bytes" },
        ],
      },
      primaryType: "MetaTransactionStruct",
      message: convertedMetaTransaction,
      signature: signature as Hex,
    });

    console.log("Signature verified.");

    if (signerAddress.toLowerCase() !== metaTransaction.from.toLowerCase()) {
      throw new Error("Invalid signature");
    }

    // Split the signature
    const signatureHex = signature.slice(2); // Remove '0x' prefix
    const { r, s } = secp256k1.Signature.fromCompact(signatureHex.slice(0, 128));
    const v = hexToNumber(`0x${signatureHex.slice(128)}`);

    // Convert r and s to hexadecimal strings
    const rHex = `0x${r.toString(16).padStart(64, "0")}`;
    const sHex = `0x${s.toString(16).padStart(64, "0")}`;

    console.log("=============", "calling");

    // Call executeMetaTransaction on the DataContract
    const tx: WriteContractReturnType = await adminClient.writeContract({
      address: dataContract.address,
      abi: dataContract.abi,
      functionName: "executeMetaTransaction",
      args: [metaTransaction.from, metaTransaction.functionSignature, rHex, sHex, v],
    });
    console.log("=============", tx);
    return NextResponse.json({ message: "Mood stored successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error storing mood:", error);
    return NextResponse.json({ message: "Error storing mood" }, { status: 500 });
  }
}
