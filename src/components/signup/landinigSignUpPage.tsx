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
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <Suspense fallback={<div>Loading...</div>}>
				    <SignUpBox dict={dict} />
                </Suspense>
			</main>
        </div>  
    );
    
}

export default LandingSignUpPage;