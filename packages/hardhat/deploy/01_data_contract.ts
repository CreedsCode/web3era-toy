import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "DataContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployDataContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy the DataContract
  await deploy("DataContract", {
    from: deployer,
    args: [deployer], // Set the deployer as the owner
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying
  const dataContract = await hre.ethers.getContract<Contract>("DataContract", deployer);
  console.log("DataContract deployed to:", await dataContract.getAddress());

  // Example of interacting with the contract after deployment
  // Whitelist the deployer (optional)
  const tx = await dataContract.updateWhitelist(deployer, true);
  await tx.wait();
  console.log("Deployer whitelisted:", deployer);
};

export default deployDataContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags DataContract
deployDataContract.tags = ["DataContract"];
