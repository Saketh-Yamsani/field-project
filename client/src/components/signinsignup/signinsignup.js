import React, { useState } from 'react';
import Signup from '../signup/signup';
import Signin from '../signin/signin';
import './signinsignup.css';

function SigninSignup({ initialForm }) {
  const [isSignIn, setIsSignIn] = useState(initialForm === 'signin');

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <div className="container">
      {isSignIn ? (
        <Signin toggleForm={toggleForm} />
      ) : (
        <Signup toggleForm={toggleForm} />
      )}
    </div>
  );
}

export default SigninSignup;
