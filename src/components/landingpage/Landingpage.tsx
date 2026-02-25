

import Link from 'next/link';
import StatsSection from '../stats/StatsSection';
import ScrollButton from './ScroollButton';
import FAQ from './FAQ';

export default function LandingPage(
    { dict }: { dict: any }
) {
    return (
        <main>
            <div className="mx-auto max-w-screen-xl sm:px-10 px-5 py-10 pt-40 mb-40">
                <div className="flex flex-col justify-center items-center">

                    <div className='text-center max-w-5xl flex flex-col justify-center items-center z-10'>
                        <h1 className="text-6xl font-bold text-white">
                            <span className='text-blue-500'>Ribe</span> Sejlklub
                        </h1>
                        <p className="text-secondaryText font-medium mt-8 text-lg max-w-2xl text-gray-300">
                            {dict.landingpage.undertitel}
                        </p>
                    </div>
                    <div className='flex sm:flex-row flex-col justify-center items-center mt-10 gap-6 w-full'>
                        <ScrollButton label={dict.landingpage.learnmore} />

                        <Link href={'/signup'} className='sm:max-w-[182px] whitespace-nowrap text-base font-sans px-5 py-2 duration-150 rounded-lg text-white shadow-2xl cursor-pointer text-center bg-[#262B31]'>
                            {dict.landingpage.signup}
                        </Link>
                    </div>
                </div>


            </div>
            <StatsSection stats={[
                { value: "100+", label: dict.landingpage.stats1 },
                { value: "50+", label: dict.landingpage.stats2 },
                { value: "20+", label: dict.landingpage.stats3 },
            ]} />

            <div id="more">
                
                <FAQ dict={dict} />
            </div>
        </main>

    );
}