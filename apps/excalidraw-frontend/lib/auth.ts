import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";

export const NEXT_AUTH_CONFIG = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? ""
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    console.log("Attempting to call backend URL:", 
                        `${process.env.HTTP_BACKEND_URL}/signin`);
                    
                    const res = await fetch(`${process.env.HTTP_BACKEND_URL}/signin`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            email: credentials?.email,
                            password: credentials?.password
                        }),
                    });

                    console.log("Response status:", res.status);
                    
                    const data = await res.json();
                    console.log("Backend response:", data);

                    if (res.status == 200&& data != null) {
                        return {
                            id: data.id,
                            name: data.name,
                            email: data.email,
                            accessToken: data.acessToken
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Authentication error:", error);
                    throw new Error('Authentication failed');
                }
            },
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            console.log("JWT callback - Token:", token, "User:", user);
            if (user) {
                token.accessToken = user.accessToken;
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }: any) {
            console.log("Session callback - Session:", session, "Token:", token);
            session.user = {
                ...session.user,
                id: token.id,
                name: token.name,
                email: token.email,
            };
            session.accessToken = token.accessToken;
            return session;
        }
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/signin',
    },
    debug: process.env.NODE_ENV === 'development'
};