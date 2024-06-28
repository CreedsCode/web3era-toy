import { ethers } from "hardhat";
import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { DataContract } from "../typechain-types";

describe("DataContract", function () {
  let DataContract: DataContract;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const DataContractFactory = await ethers.getContractFactory("DataContract");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    DataContract = await DataContractFactory.deploy(owner.address);
  });

  it("Should set the right owner", async function () {
    expect(await DataContract.owner()).to.equal(owner.address);
  });

  it("Should update the whitelist", async function () {
    // Initially, addr1 should not be whitelisted
    expect(await DataContract.whitelist(addr1.address)).to.be.false;

    // Update the whitelist
    await DataContract.updateWhitelist(addr1.address, true);

    // Now, addr1 should be whitelisted
    expect(await DataContract.whitelist(addr1.address)).to.be.true;
  });

  it("Should store data for a whitelisted user", async function () {
    // Whitelist addr1
    await DataContract.updateWhitelist(addr1.address, true);

    // Connect as addr1 and store data
    const location = "Test Location";
    await DataContract.connect(addr1).storeData(addr1.address, location);

    // Retrieve the stored data
    const dataEntries = await DataContract.getDataEntries();
    expect(dataEntries.length).to.equal(1);
    expect(dataEntries[0].user).to.equal(addr1.address);
    expect(dataEntries[0].location).to.equal(location);
  });

  it("Should not store data for a non-whitelisted user", async function () {
    // Try to store data as addr2, which is not whitelisted
    const location = "Test Location";

    await expect(DataContract.connect(addr2).storeData(addr2.address, location)).to.be.revertedWith("Not whitelisted");
  });

  it("Should get data entries by user", async function () {
    // Whitelist addr1 and addr2
    await DataContract.updateWhitelist(addr1.address, true);
    await DataContract.updateWhitelist(addr2.address, true);

    // Connect as addr1 and store data
    await DataContract.connect(addr1).storeData(addr1.address, "Location 1");
    await DataContract.connect(addr1).storeData(addr1.address, "Location 2");

    // Connect as addr2 and store data
    await DataContract.connect(addr2).storeData(addr2.address, "Location 3");

    // Retrieve data entries by user
    const addr1Entries = await DataContract.getDataEntriesByUser(addr1.address);
    expect(addr1Entries.length).to.equal(2);

    const addr2Entries = await DataContract.getDataEntriesByUser(addr2.address);
    expect(addr2Entries.length).to.equal(1);
  });
});
