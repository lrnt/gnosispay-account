import { createPublicClient, createWalletClient, http } from "viem";
import { gnosis } from "viem/chains";

import { SAFE_ABI } from "./abi-safe.js";
import { isDelayModule, isRolesModule } from "./gnosis-pay.js";

const publicClient = createPublicClient({
  chain: gnosis,
  transport: http(),
});

export async function getGnosisPayModules(address) {
  const SENTINEL_ADDRESS = "0x0000000000000000000000000000000000000001";

  const [moduleAddresses] = await publicClient.readContract({
    abi: SAFE_ABI,
    address,
    functionName: "getModulesPaginated",
    args: [SENTINEL_ADDRESS, 10],
  });
  const modules = await Promise.all(
    moduleAddresses.map(async (address) => ({
      address,
      bytecode: await publicClient.getBytecode({
        address,
      }),
    }))
  );

  const delayMod = modules.find((module) =>
    isDelayModule(module.bytecode)
  )?.address;

  const rolesMod = modules.find((module) =>
    isRolesModule(module.bytecode)
  )?.address;

  return { delayMod, rolesMod };
}