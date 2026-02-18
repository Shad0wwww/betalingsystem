import React from 'react';

interface SettingsCardProps {
    title: string;
    description: string;
    footerText?: string;
    buttonText?: string; // Nu valgfri
    onAction?: () => void; // Nu valgfri
    variant?: 'default' | 'danger';
    children?: React.ReactNode;
    disabled?: boolean;
    dialog?: React.ReactNode; // Nu valgfri
}

const SettingsCard = ({
    title,
    description,
    footerText,
    buttonText,
    onAction,
    variant = 'default',
    children,
    disabled = false,
    dialog,
}: SettingsCardProps) => {
    const isDanger = variant === 'danger';

    // Vi viser kun footer-baren, hvis der er enten footerText eller en knap
    const showFooter = footerText || buttonText;

    return (
        <div className={`w-full max-w-3xl mx-auto border rounded-lg overflow-hidden bg-[#111111] ${isDanger ? 'border-red-900/50' : 'border-[#252424]'}`}>

            <div className="p-6">
                <h2 className="text-white text-xl font-semibold mb-2">{title}</h2>
                <p className="text-gray-400 text-sm mb-5">{description}</p>

                {children && (
                    <div className="mt-4">
                        {children}
                    </div>
                )}
            </div>

            {/* Dialog sektion - vises kun hvis dialog prop findes */}
            {dialog && (
                <div className="p-6 border-t border-[#252424]">
                    <div className="flex items-center justify-end">
                        {dialog}
                    </div>
                </div>
            )}

            {/* Footer sektion - vises kun hvis der er indhold til den */}
            {showFooter && (
                <div className={`px-6 py-3 flex items-center justify-between border-t ${isDanger ? 'bg-red-950/20 border-red-900/50' : 'bg-[#111111] border-[#252424]'}`}>
                    <p className="text-gray-500 text-xs">
                        {footerText}
                    </p>

                    {buttonText && (
                        <button
                            onClick={onAction}
                            disabled={disabled}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors 
                                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                ${isDanger
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-white hover:bg-gray-200 text-black'}`}
                        >
                            {buttonText}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export { SettingsCard };