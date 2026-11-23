import { headers } from "next/headers";
import { getAuth } from "./auth"

export const getTokenFromServer = async()=>{
  const jwtToken = await getAuth().api.getToken({
    headers: await headers()
  });
  const token = jwtToken?.token;
  return token;

}