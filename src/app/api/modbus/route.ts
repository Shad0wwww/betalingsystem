import prisma from "@/lib/prisma";
import { UtilityType } from "@prisma/client";

export async function POST(request: Request) {
    const body = await request.json();
    const found_ids: number[] = body.found_ids;
    const devices: Record<string, { V: number; kWH: number; Type: string; timestamp: string }> = body.devices;

    console.log("Received device IDs:", found_ids);
    console.log("Received devices:", devices);

    const results = [];

    for (const [key, data] of Object.entries(devices)) {
        const deviceID = parseInt(key, 10);

        // Find existing record for this device
        const existing = await prisma.meterReading.findUnique({
            where: { deviceID },
        });

        if (!existing) {
            const created = await prisma.meterReading.create({
                data: {
                    deviceID: deviceID,
                    type: UtilityType.ELECTRICITY,
                    value: data.kWH,
                    date: data.timestamp,
                },
            });
            results.push({ deviceID, status: "created", type: UtilityType.ELECTRICITY, value: data.kWH });
            continue;
        }

        const updated = await prisma.meterReading.update({
            where: { deviceID },
            data: {
                type: UtilityType.ELECTRICITY,
                value: data.kWH,
                date: data.timestamp,
            },
        });

        console.log(`Updated device ${deviceID}:`, updated);
        results.push({ deviceID, status: "updated", type: UtilityType.ELECTRICITY, value: data.kWH });
    }

    return new Response(JSON.stringify({ results }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
    });
}