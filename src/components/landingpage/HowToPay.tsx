import { ShieldCheck, Anchor, CreditCard, CheckCircle2 } from "lucide-react";

export default function HowToPay(
    { dict }: { dict: any }
) {
    const steps = [
        {
            title: dict.HowToPay.steps.step1.title,
            description: dict.HowToPay.steps.step1.description,
            icon: <Anchor className="w-6 h-6 text-[#3b82f6]" />,
        },
        {
            title: dict.HowToPay.steps.step2.title,
            description: dict.HowToPay.steps.step2.description,
            icon: <ShieldCheck className="w-6 h-6 text-[#3b82f6]" />,
        },
        {
            title: dict.HowToPay.steps.step3.title,
            description: dict.HowToPay.steps.step3.description,
            icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
        },
    ];

    return (
        <section className="bg-[#0d0d0d] py-24 px-6 ">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-[#3b82f6] font-semibold tracking-widest uppercase text-sm mb-4">
                        {dict.HowToPay.title}
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {dict.HowToPay.subtitle}
                    </h3>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        {dict.HowToPay.description}
                    </p>
                </div>

                {/* Tilføjet items-stretch for at sikre ens højde i rækken */}
                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex">
                            {/* h-full sørger for at boksen fylder hele containerens højde */}
                            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/[0.08] hover:border-[#3b82f6]/50 h-full w-full">
                                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#3b82f6]/10 mb-6 shrink-0">
                                    {step.icon}
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4">
                                    {step.title}
                                </h4>
                                {/* flex-1 gør at beskrivelsen udfylder pladsen, så bunden af boksene flugter */}
                                <p className="text-gray-400 leading-relaxed flex-1">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stripe Trust Footer */}
                <div className="mt-20 flex flex-col items-center justify-center border-t border-white/10 pt-10">
                    <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-white text-sm font-medium">{dict.HowToPay.footer}</span>
                        <div className="flex items-center text-white font-bold text-2xl tracking-tighter">
                            <CreditCard className="mr-2 w-6 h-6" /> stripe
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-4 uppercase tracking-[0.2em]">
                        {dict.HowToPay.footer1}
                    </p>
                </div>
            </div>
        </section>
    );
}