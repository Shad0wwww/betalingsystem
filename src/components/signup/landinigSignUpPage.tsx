import { FC, Suspense } from 'react'
import SignUpBox from './SignUpBox'
import LoadingScreen from '../utils/LoadingScreen';

type SignupLandingPageProps = {
    dict: any;
};

const LandingSignUpPage: FC<SignupLandingPageProps> = (
    { dict }: SignupLandingPageProps
)  => {
    return (
        <div>
            <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-[#0d0d0d]">
                <Suspense fallback={<LoadingScreen />}>
				    <SignUpBox dict={dict} />
                </Suspense>
			</main>
        </div>  
    );
    
}

export default LandingSignUpPage;