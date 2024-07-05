import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
if (!adminPrivateKey) {
  throw new Error("ADMIN_PRIVATE_KEY is not set in the environment variables");
}

// Create an admin account from the private key
export const adminAccount = privateKeyToAccount(adminPrivateKey);

// Create a Viem public client for each target network
export const publicClients: { [key: number]: ReturnType<typeof createPublicClient> } =
  scaffoldConfig.targetNetworks.reduce((acc, chain) => {
    acc[chain.id] = createPublicClient({
      chain,
      transport: http(getAlchemyHttpUrl(chain.id)),
    });
    return acc;
  }, {});

// Create a Viem wallet client for the admin account for each target network
export const adminClients: { [key: number]: ReturnType<typeof createWalletClient> } =
  scaffoldConfig.targetNetworks.reduce((acc, chain) => {
    acc[chain.id] = createWalletClient({
      account: adminAccount,
      chain,
      transport: http(getAlchemyHttpUrl(chain.id)),
    });
    return acc;
  }, {});

// Get the deployed DataContract instance for each target network
export const dataContracts: { [key: number]: (typeof deployedContracts)[number]["DataContract"] } =
  scaffoldConfig.targetNetworks.reduce((acc, chain) => {
    const deployedContractsForChain = deployedContracts[chain.id];
    if (deployedContractsForChain && deployedContractsForChain.DataContract) {
      acc[chain.id] = deployedContractsForChain.DataContract;
    }
    return acc;
  }, {});
