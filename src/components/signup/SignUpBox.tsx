'use client';

import React from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import SignupAction from '@/lib/auth/SignupAction';

const SignUpBox: React.FC = () => {
    const [error, formAction] = useActionState(SignupAction, undefined);

    return (
        <div>
            <div className="border rounded-lg custom-box2 py-10 px-12">
                <div className="flex justify-center">
                    <h1 className="text-[#ffff] font-bold text-[25px] leading-none mb-2">
                        Create an account
                    </h1>
                </div>

                <form action={formAction} autoComplete="off">
                    <div className="flex justify-center">
                        <p className="text-gray-400 pb-2 text-[15px]">
                            Enter your details below to create your account
                        </p>
                    </div>

                    <div className="mb-4 pt-2">
                        <p className="text-[#ffff] font-normal text-[15px] leading-none mb-2">Full Name</p>
                        <input
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            className="w-full border rounded-md p-2 border-[#292828] bg-[#131313] text-white"
                            name="fullName" // add name for form data
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <p className="text-[#ffff] font-normal text-[15px] leading-none mb-2">Email</p>
                        <input
                            id="email"
                            type="email"
                            placeholder="example@gmail.com"
                            className="w-full border rounded-md p-2 border-[#292828] bg-[#131313] text-white"
                            name="email"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <p className="text-[#ffff] font-normal text-[15px] leading-none mb-2">Phone Number</p>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="+45 12345678"
                            className="w-full border rounded-md p-2 border-[#292828] bg-[#131313] text-white"
                            name="phone"
                        />
                    </div>

                    {error && typeof error === 'string' ? <p className="text-red-500 text-sm mb-4">{error}</p> : null}

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="w-full text-sm text-center py-2 font-medium bg-white text-black ease-in-out duration-150 rounded-md mt-3"
                        >
                            Lav konto
                        </button>
                    </div>

                    <div className="flex">
                        <p className="text-gray-400 py-2 text-[15px]">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-white underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpBox;