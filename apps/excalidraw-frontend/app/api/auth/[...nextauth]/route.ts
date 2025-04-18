
import { NEXT_AUTH_CONFIG } from "@/lib/auth"
import NextAuth from "next-auth"

const handler = NextAuth({
  ...NEXT_AUTH_CONFIG,
  session: {
	...NEXT_AUTH_CONFIG.session,
	strategy: "jwt", // Ensure this matches the expected SessionStrategy type
  },
})

export { handler as GET, handler as POST }