import { StonApiClient } from "@ston-fi/api";
import { Client, dexFactory } from "@ston-fi/sdk";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

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
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return new Response("Invalid JSON body", { status: 400 });
  const { walletAddress, offerAddress, askAddress, offerUnits, slippageTolerance } = body;

  if (!walletAddress || !offerAddress || !askAddress || !offerUnits || !slippageTolerance) {
    return new Response("Missing required fields", { status: 400 });
  }

  const apiClient = new StonApiClient();

  // 1) Simulate swap (API-driven routing)
  const simulationResult = await apiClient.simulateSwap({
    offerAddress,
    askAddress,
    offerUnits,
    slippageTolerance
  });

  // 2) Build contracts from router info
  const { router: routerInfo } = simulationResult;
  const dexContracts = dexFactory(routerInfo);

  // 3) Open router via STON.fi SDK client
  const tonClient = new Client({
    endpoint: "https://toncenter.com/api/v2/jsonRPC"
  });

  const router = tonClient.open(dexContracts.Router.create(routerInfo.address));
  const proxyTon = dexContracts.pTON.create(routerInfo.ptonMasterAddress);

  // 4) Build tx params based on route type (SDK v2)
  const offerIsTon = isTon(simulationResult.offerAddress);
  const askIsTon = isTon(simulationResult.askAddress);

  const txParams = offerIsTon
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
}

