import { FC, Suspense } from 'react'
import SignUpBox from './SignUpBox'

type SignupLandingPageProps = {
    dict: any;
};

const LandingSignUpPage: FC<SignupLandingPageProps> = (
    { dict }: SignupLandingPageProps
)  => {
    return (
        <div>
            <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-[#0a0a0a]">
                <Suspense fallback={<div>Loading...</div>}>
				    <SignUpBox dict={dict} />
                </Suspense>
			</main>
        </div>  
    );
    
}

export default LandingSignUpPage;