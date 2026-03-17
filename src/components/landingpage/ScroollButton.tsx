'use client';

import { useCallback } from 'react';

export default function ScrollButton(
    { label }: { label: string }
) {
    const handleClick = useCallback(() => {
        const el = document.getElementById('more');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    return (
        <button
            onClick={handleClick}
            className='w-full sm:w-auto sm:max-w-[160px] whitespace-nowrap text-base px-5 font-sans py-2 bg-blue-600 hover:bg-blue-700 duration-150 rounded-lg text-white shadow-2xl'>
            {label}
        </button>
    );
}