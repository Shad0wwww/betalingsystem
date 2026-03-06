import React from 'react';

interface SettingsCardProps {
    title: string;
    description: string;
    footerText?: string;
    buttonText?: string;
    onAction?: () => void;
    variant?: 'default' | 'danger';
    children?: React.ReactNode;
    disabled?: boolean;
    dialog?: React.ReactNode;
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
    const showFooter = footerText || buttonText;

    return (
        <div className={`w-full max-w-3xl mx-auto rounded-xl overflow-hidden border bg-[#0f0f0f] ${
            isDanger ? 'border-red-900/40' : 'border-white/[0.07]'
        }`}>

            {/* Body */}
            <div className="p-6">
                <h2 className={`text-base font-semibold mb-1 ${
                    isDanger ? 'text-red-400' : 'text-white'
                }`}>{title}</h2>
                <p className="text-white/40 text-sm leading-relaxed">{description}</p>

                {children && (
                    <div className="mt-5">
                        {children}
                    </div>
                )}
            </div>

            {/* Dialog row */}
            {dialog && (
                <div className={`px-6 py-4 border-t flex items-center justify-end ${
                    isDanger ? 'border-red-900/40' : 'border-white/[0.07]'
                }`}>
                    {dialog}
                </div>
            )}

            {/* Footer / action row */}
            {showFooter && (
                <div className={`px-6 py-3 flex items-center justify-between border-t ${
                    isDanger
                        ? 'bg-red-950/20 border-red-900/40'
                        : 'bg-white/[0.02] border-white/[0.07]'
                }`}>
                    <p className="text-white/30 text-xs">{footerText}</p>

                    {buttonText && (
                        <button
                            onClick={onAction}
                            disabled={disabled}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                                disabled ? 'opacity-40 cursor-not-allowed' : ''
                            } ${
                                isDanger
                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
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