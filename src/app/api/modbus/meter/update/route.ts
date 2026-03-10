import prisma from "@/lib/prisma";
import { MeterStatus, UtilityType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


import {getElPriser} from "@/lib/El/kWH/GetkWHPrices";

interface UpdateMeterRequest {
    devices: {
        [id: string]: {
            V: number;
            kWH: number;
            Type: UtilityType;
            timestamp: string;
        };
    };
    found_ids: number[];
}

export async function POST(
    req: NextRequest
) {
    
    const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!apiKey) {
        return NextResponse.json({ error: "Missing API key" }, { status: 401 });
    }

    if (apiKey !== process.env.APIKEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = (await req.json()) as UpdateMeterRequest;

    if (!data || !data.devices || typeof data.devices !== "object") {
        console.error("Invalid request body:", data);
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    for (const [id, device] of Object.entries(data.devices)) {

        if (!device.V || !device.kWH || !device.Type || !device.timestamp) {
            console.error(`Missing fields for device ${id}:`, device);
            continue;
        }

        const inDatabase = await prisma.meter.findUnique({
            where: { deviceId: id },
        });



        if (!inDatabase) {
            console.warn(`Device with ID ${id} not found in database. Skipping update.`);
            continue;
        }

        const [datePart, timePart] = device.timestamp.split(" ");
        const [day, month, year] = datePart.split("-");
        const parsedDate = new Date(`${year}-${month}-${day}T${timePart}`);

        let spotPris: number | undefined = undefined;
        try {
            const elpriser = await getElPriser();
            console.log(`Fetched electricity prices for device ${id}:`, elpriser);
            spotPris = elpriser.prisLigenu.pris;
        } catch (err) {
            console.warn("Could not fetch electricity prices (non-critical):", err);
        }

        await prisma.meter.update({
            where: { deviceId: id },
            data: {
                status: MeterStatus.ONLINE,
                readings: {
                    create: {
                        type: device.Type,
                        value: device.kWH,
                        volttage: device.V,
                        spotPris: spotPris,
                        date: parsedDate,
                    },
                },
            },
        });
    }


    return NextResponse.json({ message: "Meter updated successfully" }, { status: 200 });
}