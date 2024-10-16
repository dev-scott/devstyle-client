// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { authConfig } from "./authconfig";
// import { connectToDB } from "./lib/utils";
// import bcrypt from "bcrypt";
// import UserModel from "./models/user";

// const login = async (credentials) => {
//   try {
//     connectToDB();
//     const user = await UserModel.findOne({ username: credentials.username });

//     if (!user || user.role!="admin") throw new Error("Wrong credentials!");

//     const isPasswordCorrect = await bcrypt.compare(
//       credentials.password,
//       user.password
//     );

//     if (!isPasswordCorrect) throw new Error("Wrong credentials!");

//     return user;
//   } catch (err) {
//     console.log(err);
//     throw new Error("Failed to login!");
//   }
// };

// export const { signIn, signOut, auth } = NextAuth({
//   ...authConfig,
//   providers: [
//     CredentialsProvider({
//       async authorize(credentials) {
//         try {
//           const user = await login(credentials);
//           return user;
//         } catch (err) {
//           return null;
//         }
//       },
//     }),
//   ],
//   // ADD ADDITIONAL INFORMATION TO SESSION
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.username = user.username;
//         token.avatar = user.avatar.url;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.username = token.username;
//         session.user.avatar = token.img;
//       }
//       return session;
//     },
//   },
// });
