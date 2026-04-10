import prisma from "@/lib/prisma";
import { MeterStatus, UtilityType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getElPriser } from "@/lib/El/kWH/GetkWHPrices";

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

export async function POST(req: NextRequest) {
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
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 },
        );
    }
    if (Object.keys(data.devices).length === 0) {
        console.warn("No devices provided in the request body.");
        return NextResponse.json(
            { message: "No devices to update" },
            { status: 200 },
        );
    }

    // Fetch electricity price once before the loop
    let spotPris: number | undefined = undefined;
    try {
        const elpriser = await getElPriser();
        spotPris = elpriser.prisLigenu.pris;
    } catch (err) {
        console.warn("Could not fetch electricity prices (non-critical):", err);
    }

    // Fetch all relevant meters in one query
    const ids = Object.keys(data.devices);
    const meters = await prisma.meter.findMany({
        where: { deviceId: { in: ids } },
    });
    const meterMap = new Map(meters.map((m) => [m.deviceId, m]));

    for (const [id, device] of Object.entries(data.devices)) {
        if (!device.V || !device.kWH || !device.Type || !device.timestamp) {
            console.error(`Missing fields for device ${id}:`, device);
            continue;
        }
        if (!Object.values(UtilityType).includes(device.Type)) {
            console.error(`Invalid utility type for device ${id}:`, device.Type);
            continue;
        }
        if (isNaN(device.V) || isNaN(device.kWH)) {
            console.error(`Invalid numeric values for device ${id}:`, device);
            continue;
        }

        const inDatabase = meterMap.get(id);
        if (!inDatabase) {
            console.warn(
                `Device with ID ${id} not found in database. Skipping update.`,
            );
            continue;
        }

        const [datePart, timePart] = device.timestamp.split(" ");
        const [day, month, year] = datePart.split("-");
        const parsedDate = new Date(`${year}-${month}-${day}T${timePart}`);

        // Check for existing reading within the same hour bucket
        const bucketStart = new Date(parsedDate);
        bucketStart.setMinutes(0, 0, 0);
        const bucketEnd = new Date(bucketStart);
        bucketEnd.setHours(bucketStart.getHours() + 1);

        const existingReading = await prisma.meterReading.findFirst({
            where: {
                meter: { deviceId: id },
                date: {
                    gte: bucketStart,
                    lt: bucketEnd,
                },
            },
        });

        if (existingReading) {
            
            await prisma.meterReading.update({
                where: { id: existingReading.id },
                data: {
                    value: device.kWH,
                    volttage: device.V,
                    spotPris: spotPris,
                    date: parsedDate,
                },
            });
        } else {
            
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
    }

    return NextResponse.json(
        { message: "Meter updated successfully" },
        { status: 200 },
    );
}
