'use client';

import Link from 'next/link';

export default function LandingPage(
    { dict }: { dict: any }
) {


    return (
        <div className="mx-auto max-w-screen-xl sm:px-10 px-5 py-10 pt-40">
            <div className="flex flex-col justify-center items-center">
                <div className='text-center max-w-5xl flex flex-col justify-center items-center z-10'>
                    <h1 className="text-6xl font-bold text-white">
                        <span className='text-blue-500'>Ribe</span> Sejlklub
                    </h1>
                    <p className="text-secondaryText font-medium mt-8 text-lg max-w-2xl text-gray-300">
                        {dict.landingpage.undertitel}
                    </p>
                </div>
                <div className='flex sm:flex-row flex-col justify-center items-center mt-6 gap-6 w-full'>
                    <button
                        onClick={() => {
                            window.scrollTo({
                                top: (document.getElementById('more')?.offsetTop ?? 0) - 50,
                                behavior: 'smooth'
                            })
                        }}
                        className='sm:max-w-[140px] w-full whitespace-nowrap text-base px-4 py-2 bg-blue-600 hover:bg-blue-800 duration-150 rounded-lg text-white font-semibold shadow-2xl cursor-pointer text-center'>
                        {dict.landingpage.learnmore}
                    </button>

                    <Link href={'/signup'} className='sm:max-w-[182px] w-full whitespace-nowrap text-base px-9 py-2 duration-150 rounded-lg text-white font-semibold shadow-2xl cursor-pointer text-center bg-[#262B31]'>
                        {dict.landingpage.signup}
                    </Link>
                </div>
            </div>

        </div>
    );
}