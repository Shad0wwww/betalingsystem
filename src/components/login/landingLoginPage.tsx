import { FC } from 'react'

import { Suspense } from 'react';
import LoginBox from './loginBox';

const LandingLoginPage: FC = ({ }) => {
    return (
        <div>
            <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-[#0a0a0a]">
                <Suspense fallback={<div>Loading...</div>}>
				    <LoginBox />
                </Suspense>
			</main>
        </div>  
    );
    
}

export default LandingLoginPage;