import dbConnect from "../../../lib/dbConnect";
import createlink from "../../../models/createlink";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const autolink = req.nextUrl.searchParams.get("autolink");
    try {
        await dbConnect();
        const createlinks = await createlink.findOne({ createlink: autolink });

        return Response.json(JSON.stringify(createlinks));
    } catch (error) {
        console.error(error);
        return Response.json({ error: "error" }, { status: 400 });
    }
}

export async function POST(req: Request) {
    const body = await req.json();
    const { autolink, transactionHash, network } = body;
    try {
        await dbConnect();

        const res = await createlink.updateOne(
            { createlink: autolink },
            { transactionHash: transactionHash, network: network }
        );

        return Response.json(JSON.stringify(res));

    } catch (error) {
        console.error(error);
        return Response.json({ error: error }, { status: 400 });
    }
}