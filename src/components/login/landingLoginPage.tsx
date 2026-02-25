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
            <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-[#0d0d0d]">
                <Suspense fallback={<LoadingScreen />}>
				    <LoginBox dict={dict} email={email} />
                </Suspense>
			</main>
        </div>  
    );
    
}

export default LandingLoginPage;