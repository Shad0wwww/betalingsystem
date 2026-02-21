'use client'
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import "@/components/modals/styles.css";

const FormContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="border rounded-lg custom-box2 py-8 px-5 sm:py-10 sm:px-12 border-[#292828] bg-[#131313]">
        {children}
    </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-4">
        <label className="block text-white font-normal text-[15px] leading-none mb-2">
            {label}
        </label>
        {children}
    </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        suppressHydrationWarning
        className="w-full border rounded-md p-3 sm:p-2 border-[#292828] bg-[#111111] text-white focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all"
    />
);

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
                    <Dialog.Title className="text-white font-semibold text-lg mb-3 leading-3">
                        Opret nyt skib
                    </Dialog.Title>
             
                    <Field label="Skibets navn">
                        <Input 
                            type="text" 
                            name="shipName" 
                            placeholder="Indtast skibets navn" 
                            required
                        />
                    </Field>
                    <Field label="Skibets model">
                        <Input 
                            type="text" 
                            name="shipModel" 
                            placeholder="Indtast skibets model"
                            required 
                        />
                    </Field>
                    <button
                        type="submit"
                  
                        className="w-full py-3 font-medium bg-white text-black rounded-md mt-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Opret Skib  
                    </button>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )


}