import { FC } from 'react'

import { Suspense } from 'react';
import LoginBox from './loginBox';


type LandingLoginPageProps = {
    dict: any;
};

const LandingLoginPage: FC<LandingLoginPageProps> = (
    { dict }: LandingLoginPageProps
) => {
    return (
        <div>
            <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-[#0d0d0d]">
                <Suspense fallback={<div>Loading...</div>}>
				    <LoginBox dict={dict} />
                </Suspense>
			</main>
        </div>  
    );
    
}

export default LandingLoginPage;