// import axios from "axios";

// const BCKND_URL = `http://localhost:3001/api/users`;

// export const api = {
//   fetchUser: async (token: string) => {
//     const res = await axios.get(`${BCKND_URL}/user`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return res;
//   },
//   signUpUser: async (user: User) => {
//     try {
//       await axios.post(`${BCKND_URL}/register`, user);
//     } catch (error) {
//       console.log(error);
//     }
//   },
//   loginUser: async (user: User) => {
//     try {
//       return await axios.post(`${BCKND_URL}/login`, user);
//     } catch (error) {
//       console.log(error);
//     }
//   },
// };
