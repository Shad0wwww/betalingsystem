export default function GridContainer(
    { children }: { children: React.ReactNode }
) {
    return (
        <div className="mx-auto max-w-screen-xl px-4 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 justify-center">
                {children}
            </div>
        </div>
    );
}