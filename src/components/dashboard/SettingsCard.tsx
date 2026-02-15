interface SettingsCardProps {
    title: string;
    description: string;
    footerText?: string;
    buttonText: string;
    onAction: () => void;
    variant?: 'default' | 'danger';
    children?: React.ReactNode;
}

const SettingsCard = ({
    title,
    description,
    footerText,
    buttonText,
    onAction,
    variant = 'default',
    children
}: SettingsCardProps) => {
    const isDanger = variant === 'danger';

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

 
            <div className={`px-6 py-3 flex items-center justify-between border-t ${isDanger ? 'bg-red-950/20 border-red-900/50' : 'bg-[#111111] border-[#252424]'}`}>
                <p className="text-gray-500 text-xs">
                    {footerText}
                </p>
                <button
                    onClick={onAction}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors 
            ${isDanger
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-white hover:bg-gray-200 text-black'}`}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export { SettingsCard };