'use client'
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import "@/components/modals/styles.css";

export default function UdbetalModal({ dict }: { dict: any }) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="cursor-pointer text-white font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 rounded-md text-center px-7 py-[7px] min-w-[55.5px] border border-emerald-500/30 shadow-md shadow-emerald-900/30 transition-all">
                {dict?.dashboard?.oversigt?.payoutbutton ?? 'Udbetal'}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <div className="mb-6">
                        <Dialog.Title className="text-white font-semibold text-xl mb-1">
                            Opret udbetalingsanmodning
                        </Dialog.Title>
                        <p className="text-zinc-500 text-sm">
                            Tilknyt din server via UnikPay for at foretage en udbetaling.
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                            </svg>
                        </div>
                        <p className="text-zinc-400 text-sm">Udbetalingsfunktionen er endnu ikke tilgængelig.</p>
                    </div>

                    <Dialog.Close asChild>
                        <button className="IconButton" aria-label="Close">
                            <Cross2Icon />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}