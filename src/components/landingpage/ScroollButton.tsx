'use client';

export default function ScrollButton(
    { label }: { label: string }
) {
    const handleClick = () => {
        const el = document.getElementById('more');
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 50,
                behavior: 'smooth'
            });
        }
    };

    return (
        <button
            onClick={handleClick}
            className='sm:max-w-[140px] whitespace-nowrap text-base px-5 font-sans py-2 bg-blue-600 hover:bg-blue-800 duration-150 rounded-lg text-white shadow-2xl'>
            {label}
        </button>
    );
}