import { FC } from 'react'

import { Suspense } from 'react';
import LoginBox from './loginBox';

const LandingLoginPage: FC = ({ }) => {
    return (
        <div>
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <Suspense fallback={<div>Loading...</div>}>
				    <LoginBox />
                </Suspense>
			</main>
        </div>  
    );
    
}

export default LandingLoginPage;