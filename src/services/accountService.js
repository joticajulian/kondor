import axios from "axios";

const API_BASE_URL =
  "http://rest-koinos-env.eba-maqmj2nv.us-east-1.elasticbeanstalk.com/api";

export const getAccountHistory = async (address, limit = 20) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/account/${address}/history?limit=40&ascending=false`,
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching account history:", error);
    throw error;
  }
};
