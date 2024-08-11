import dbConnect from "../../../lib/dbConnect";
import votelink from "../../../models/votelink";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const autolink = req.nextUrl.searchParams.get("autolink");
    try {
        await dbConnect();
        const votelinks = await votelink.findOne({ votelink: autolink });

        return Response.json(JSON.stringify(votelinks));
    } catch (error) {
        console.error(error);
        return Response.json({ error: "error" }, { status: 400 });
    }
}

export async function POST(req: Request) {
    const body = await req.json();
    const { autolink, transactionHash, network, voteId } = body;
    try {
        await dbConnect();
        
        const res = await votelink.updateOne(
            { votelink: autolink },
            { transactionHash: transactionHash, network: network }
        );

        return Response.json(JSON.stringify(res));

    } catch (error) {
        console.error(error);
        return Response.json({ error: error }, { status: 400 });
    }
}