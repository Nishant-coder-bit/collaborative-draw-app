"use client"
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e:any) => {
    e.preventDefault();

    const result = await signIn('credentials', {
      redirect: false, // Prevent default redirect
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      // Successfully signed in, you can redirect the user

      router.push('/room'); // Example: Redirect to dashboard
    }
  };

  const handleGitHubSignIn = () => {
    signIn('github');
  };

  const handleGoogleSignIn = () => {
    signIn('google');
  };

  return (
    <div>
      <h1>Sign In</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSignIn}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Sign in with Credentials</button>
      </form>

      <button onClick={handleGitHubSignIn}>Sign in with GitHub</button>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
}