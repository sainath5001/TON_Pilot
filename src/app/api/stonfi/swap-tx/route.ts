import { StonApiClient } from "@ston-fi/api";
import { Client, dexFactory } from "@ston-fi/sdk";
import type { NextRequest } from "next/server";
import { getHttpEndpoint } from "@orbs-network/ton-access";

export const runtime = "nodejs";

let cachedTonAssetAddress: string | null = null;
let cachedTonAssetAddressPromise: Promise<string> | null = null;

async function resolveTonAssetAddress(apiClient: StonApiClient) {
  if (cachedTonAssetAddress) return cachedTonAssetAddress;
  if (!cachedTonAssetAddressPromise) {
    cachedTonAssetAddressPromise = (async () => {
      const assets = await apiClient.getAssets();
      const ton = assets.find((a) => a.kind === "Ton");
      if (!ton) throw new Error("Failed to resolve TON asset address from STON.fi API");
      cachedTonAssetAddress = ton.contractAddress;
      return ton.contractAddress;
    })().finally(() => {
      cachedTonAssetAddressPromise = null;
    });
  }
  return cachedTonAssetAddressPromise;
}

type Body = {
  walletAddress: string;
  offerAddress: string; // "ton" or jetton master address
  askAddress: string; // "ton" or jetton master address
  offerUnits: string; // integer string in blockchain units
  slippageTolerance: string; // "0.01"
};

function isTon(addr: string) {
  return addr === "ton";
}

export async function POST(req: NextRequest) {
  // Prevent "infinite" hangs; return a clear 504 for demos.
  const overallTimeoutMs = 90_000;

  const handler = async () => {
    try {
      const body = (await req.json().catch(() => null)) as Body | null;
      if (!body) return new Response("Invalid JSON body", { status: 400 });
      const { walletAddress, offerAddress, askAddress, offerUnits, slippageTolerance } = body;

      if (!walletAddress || !offerAddress || !askAddress || !offerUnits || !slippageTolerance) {
        return new Response("Missing required fields", { status: 400 });
      }

      const apiClient = new StonApiClient();

      let tonAssetAddress: string;
      try {
        tonAssetAddress = await resolveTonAssetAddress(apiClient);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown error";
        console.error("STON.fi swap-tx: resolveTonAssetAddress failed:", e);
        return new Response(`resolveTonAssetAddress failed: ${msg}`, { status: 502 });
      }

  // STON.fi API expects TON as its special asset contract address (not literal "ton" in practice).
      const offerAddressForApi = isTon(offerAddress) ? tonAssetAddress : offerAddress;
      const askAddressForApi = isTon(askAddress) ? tonAssetAddress : askAddress;

  // 1) Simulate swap (API-driven routing)
      let simulationResult: Awaited<ReturnType<StonApiClient["simulateSwap"]>>;
      try {
        simulationResult = await apiClient.simulateSwap({
          offerAddress: offerAddressForApi,
          askAddress: askAddressForApi,
          offerUnits,
          slippageTolerance
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown error";
        console.error("STON.fi swap-tx: simulateSwap failed:", e, {
          offerAddress: offerAddressForApi,
          askAddress: askAddressForApi,
          offerUnits,
          slippageTolerance
        });
        return new Response(`simulateSwap failed: ${msg}`, { status: 502 });
      }

  // 2) Build contracts from router info
      const { router: routerInfo } = simulationResult;
      let dexContracts: ReturnType<typeof dexFactory>;
      try {
        dexContracts = dexFactory(routerInfo);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown error";
        console.error("STON.fi swap-tx: dexFactory failed:", e, { routerInfo });
        return new Response(`dexFactory failed: ${msg}`, { status: 502 });
      }

  // 3) Open router via STON.fi SDK client
      const toncenterApiKey = process.env.TONCENTER_API_KEY;
      // If TON_RPC_ENDPOINT isn't provided, prefer TON Access (Orbs) which is TonClient-compatible
      // and often more reliable than direct toncenter calls.
      const endpoint =
        process.env.TON_RPC_ENDPOINT ??
        (await getHttpEndpoint({ network: "mainnet", protocol: "json-rpc" }));
      const tonClient = new Client({
        endpoint,
        apiKey: toncenterApiKey || undefined,
        timeout: 30_000
      });

      const router = tonClient.open(dexContracts.Router.create(routerInfo.address));
      const proxyTon = dexContracts.pTON.create(routerInfo.ptonMasterAddress);

  // 4) Build tx params based on route type (SDK v2)
      const offerIsTon = simulationResult.offerAddress === tonAssetAddress;
      const askIsTon = simulationResult.askAddress === tonAssetAddress;

      let txParams;
      try {
        txParams = offerIsTon
          ? await router.getSwapTonToJettonTxParams({
              userWalletAddress: walletAddress,
              offerAmount: simulationResult.offerUnits,
              minAskAmount: simulationResult.minAskUnits,
              askJettonAddress: simulationResult.askAddress,
              proxyTon
            })
          : askIsTon
            ? await router.getSwapJettonToTonTxParams({
                userWalletAddress: walletAddress,
                offerJettonAddress: simulationResult.offerAddress,
                offerAmount: simulationResult.offerUnits,
                minAskAmount: simulationResult.minAskUnits,
                proxyTon
              })
            : await router.getSwapJettonToJettonTxParams({
                userWalletAddress: walletAddress,
                offerJettonAddress: simulationResult.offerAddress,
                askJettonAddress: simulationResult.askAddress,
                offerAmount: simulationResult.offerUnits,
                minAskAmount: simulationResult.minAskUnits
              });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown error";
        console.error("STON.fi swap-tx: router tx params build failed:", e, {
          endpoint,
          offerIsTon,
          askIsTon,
          offerAddress: simulationResult.offerAddress,
          askAddress: simulationResult.askAddress
        });
        return new Response(`router tx build failed: ${msg} [endpoint=${endpoint}]`, { status: 502 });
      }

    // 5) Return in TonConnect sendTransaction-friendly format
      return Response.json({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: txParams.to.toString(),
            amount: txParams.value.toString(),
            payload: txParams.body?.toBoc().toString("base64")
          }
        ]
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "unknown error";
      console.error("STON.fi swap-tx: unexpected failure:", e);
      return new Response(`unexpected swap-tx failure: ${msg}`, { status: 502 });
    }
  };

  return await Promise.race([
    handler(),
    new Promise<Response>((resolve) =>
      setTimeout(() => resolve(new Response("Swap builder timed out (try again).", { status: 504 })), overallTimeoutMs)
    )
  ]);
}

