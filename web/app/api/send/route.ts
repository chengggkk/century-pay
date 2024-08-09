import dbConnect from "../../../lib/dbConnect";
import sendlink from "../../../models/sendlink";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const sendautolink = req.nextUrl.searchParams.get("sendautolink");
    try {
        await dbConnect();
        const sendlinks = await sendlink.findOne({ sendautolink });

        return Response.json(JSON.stringify(sendlinks));
    } catch (error) {
        console.error(error);
        return Response.json({ error: "error" }, { status: 400 });
    }
}

export async function POST(req: Request) {
    const body = await req.json();
    const { sendautolink, transactionHash, network } = body;
    try {
        await dbConnect();

        const res = await sendlink.updateOne(
            { sendautolink: sendautolink },
            { transactionHash: transactionHash, network: network }
        );

        return Response.json(JSON.stringify(res));

    } catch (error) {
        console.error(error);
        return Response.json({ error: error }, { status: 400 });
    }
}