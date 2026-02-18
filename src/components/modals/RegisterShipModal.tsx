'use client'
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import "@/components/modals/styles.css";

export default function RegisterShipModal(

) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors bg-white hover:bg-gray-200 text-black `}>
                REGISTRÉR SKIB
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent box-color custom-border box-shadow">
                    <Dialog.Title className="text-white font-semibold text-lg mb-1 leading-3">
                        Opret nyt skib
                    </Dialog.Title>
                    <div className="flex flex-col">
                        <p className="sub-headline text-sm">
                            Tilknyt dit nye skib via UnikPay.
                        </p>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )


}