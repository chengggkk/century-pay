import dbConnect from "../../../lib/dbConnect";
import userlink from "../../../models/userlink";
import {
    createConfig,
} from "wagmi";
import { verifyMessage, http } from "@wagmi/core";
import {
    base,
    baseSepolia,
    mainnet,
    optimism,
    optimismSepolia,
    sepolia,
} from "wagmi/chains";


const chains = [
    mainnet,
    sepolia,
    base,
    baseSepolia,
    optimism,
    optimismSepolia,
] as const;
const signConfig = createConfig({
    chains: chains,
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [base.id]: http(),
        [baseSepolia.id]: http(),
        [optimism.id]: http(),
        [optimismSepolia.id]: http(),
    },
});


export async function GET(req: Request) {

    try {
        await dbConnect();
        const userlinks = await userlink.find({});

        return Response.json(JSON.stringify(userlinks));
    } catch (error) {
        console.error(error);
        return Response.error();
    }
}

export async function POST(req: Request) {
    const body = await req.json();
    const { autolink, address, message, signature } = body;
    try {
        await dbConnect();
        const result = await verifyMessage(signConfig as any, {
            address: address as `0x${string}`,
            message: message,
            signature: signature,
        });
        if (result) {
            const res = await userlink.updateOne(
                { autolink: autolink },
                { address: address }
            );

            return Response.json(JSON.stringify(res));
        }
        else {
            return Response.error();
        }
    } catch (error) {
        console.error(error);
        return Response.error();
    }
}