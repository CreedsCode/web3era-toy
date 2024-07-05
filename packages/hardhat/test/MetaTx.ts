import { ethers } from "hardhat";
import { expect } from "chai";
import { HDNodeWallet } from "ethers";
import { DataContract } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { signTypedData_v4 } from "eth-sig-util";
import { fromRpcSig } from "ethereumjs-util";

describe("DataContract MetaTransaction", function () {
  let dataContract: DataContract;
  let owner: HardhatEthersSigner;
  let relayer: HardhatEthersSigner;
  let userWallet: HDNodeWallet;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const DataContractFactory = await ethers.getContractFactory("DataContract");
    [owner, relayer] = await ethers.getSigners();

    // Deploy the contract
    dataContract = (await DataContractFactory.deploy(owner.address)) as DataContract;
    // await dataContract.deployed();

    // Generate a new wallet for the user
    userWallet = ethers.Wallet.createRandom().connect(ethers.provider);

    // Whitelist the new user wallet
    await dataContract.updateWhitelist(userWallet.address, true);
  });

  it("Should store data via meta-transaction", async function () {
    const domain = {
      name: "DataContract",
      version: "1",
      chainId: Number((await ethers.provider.getNetwork()).chainId),
      verifyingContract: await dataContract.getAddress(),
    };

    const nonce = await dataContract.nonces(userWallet.address);
    const functionSignature = dataContract.interface.encodeFunctionData("storeData", [
      userWallet.address,
      "MetaTransaction Location",
    ]);

    const message = {
      nonce: Number(nonce),
      from: userWallet.address,
      functionSignature: functionSignature,
    };

    const data = {
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
      domain: domain,
      primaryType: "MetaTransactionStruct",
      message: message,
    };

    // Use eth-sig-util to sign the typed data
    const privateKey = Buffer.from(userWallet.privateKey.slice(2), "hex");
    const signature = signTypedData_v4(privateKey, { data: data });
    const { r, s, v } = fromRpcSig(signature);

    await expect(dataContract.connect(relayer).executeMetaTransaction(userWallet.address, functionSignature, r, s, v))
      .to.emit(dataContract, "MetaTransactionExecuted")
      .withArgs(userWallet.address, relayer.address, functionSignature);

    const dataEntries = await dataContract.getDataEntries();
    console.log(dataEntries, "created data entry");
    expect(dataEntries.length).to.equal(1);
    expect(dataEntries[0].user).to.equal(userWallet.address);
    expect(dataEntries[0].location).to.equal("MetaTransaction Location");
  });
});
