'use client'
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import "@/components/modals/styles.css";

export default function UdbetalModal(

) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className={`cursor-pointer text-white font-bold text-xs bg-green-600 rounded-md text-center px-7 py-[7px] min-w-[55.5px] `}>
                UDBETAL
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent box-color custom-border box-shadow">
                    <Dialog.Title className="text-white font-semibold text-lg mb-1 leading-3">
                        Opret udbetalingsanmodning
                    </Dialog.Title>
                    <div className="flex flex-col">
                        <p className="sub-headline text-sm">
                            Tilknyt din server via UnikPay.
                        </p>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )


}