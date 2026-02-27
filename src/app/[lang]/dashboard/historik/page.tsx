
import { cookies } from "next/headers"
import { columns, Payment } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
    const cookieStore = await cookies()

    const token = cookieStore.get("auth_token")?.value
    // Fetch data from your API here.

    const response = await fetch(`${process.env.URL_BASE}/api/transaktioner/all`, {
        method: "GET",
        credentials: "include", 
        headers: {
            "authorization": `Bearer ${token}`,
        },

    })
    
    const data = await response.json()

    return data
}

export default async function DemoPage() {
    const data = await getData()

    return (
        <div className="mx-auto max-w-screen-xl px-4 md:px-20">
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={data} />
              
            </div>
        </div>
            
    
        
    )
}