import { FC } from 'react'

import { Suspense } from 'react';
import LoginBox from './loginBox';
import LoadingScreen from '../utils/LoadingScreen';


type LandingLoginPageProps = {
    dict: any;
    email?: string;
};

const LandingLoginPage: FC<LandingLoginPageProps> = (
    { dict, email }: LandingLoginPageProps
) => {
    return (
        <div>
            <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-[#0d0d0d] overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black_10%,transparent_100%)] pointer-events-none" />
                <div className="absolute w-[600px] h-[500px] rounded-full bg-blue-600/[0.08] blur-[120px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <Suspense fallback={<LoadingScreen />}>
				    <LoginBox dict={dict} email={email} />
                </Suspense>
			</main>
        </div>  
    );
    
}

export default LandingLoginPage;