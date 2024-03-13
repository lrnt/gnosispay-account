import { createPublicClient, getAddress, http } from "viem";
import { gnosis } from "viem/chains";

import { SAFE_ABI } from "./abi-safe.js";

const publicClient = createPublicClient({
  chain: gnosis,
  transport: http(),
});

const SENTINEL_ADDRESS = "0x0000000000000000000000000000000000000001";
const DELAY_MOD_MASTERCOPY = "0x4A97E65188A950Dd4b0f21F9b5434dAeE0BBF9f5";
const ROLES_MOD_MASTERCOPY = "0x9646fDAD06d3e24444381f44362a3B0eB343D337";

export function isGenericProxy(bytecode) {
  if (bytecode.length !== 92) return false;
  return (
    bytecode.startsWith("0x363d3d373d3d3d363d73") &&
    bytecode.endsWith("5af43d82803e903d91602b57fd5bf3")
  );
}

export function getGenericProxyMastercopy(bytecode) {
  if (!isGenericProxy(bytecode)) return null;
  return "0x" + bytecode.substring(22, 22 + 40);
}

export function isDelayModule(bytecode) {
  return (
    getAddress(getGenericProxyMastercopy(bytecode)) ===
    getAddress(DELAY_MOD_MASTERCOPY)
  );
}

export function isRolesModule(bytecode) {
  return (
    getAddress(getGenericProxyMastercopy(bytecode)) ===
    getAddress(ROLES_MOD_MASTERCOPY)
  );
}

export async function getSafeModules(address) {
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
  return modules;
}

export async function getGnosisPayModules(address) {
  const modules = await getSafeModules(address);

  const delayMod = modules.find((module) =>
    isDelayModule(module.bytecode)
  )?.address;

  const rolesMod = modules.find((module) =>
    isRolesModule(module.bytecode)
  )?.address;

  return { delayMod, rolesMod };
}
