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
            className='w-full sm:w-auto sm:max-w-[160px] whitespace-nowrap text-base px-5 font-sans py-2 bg-blue-600 hover:bg-blue-700 duration-150 rounded-lg text-white shadow-2xl'>
            {label}
        </button>
    );
}