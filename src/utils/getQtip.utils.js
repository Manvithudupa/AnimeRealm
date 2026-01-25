import axios from "axios";

const getQtip = async (id) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL;

    if (!baseUrl) {
      throw new Error("VITE_API_URL is not defined");
    }

    const animeId = id.split("-").pop();

    const response = await axios.get(
      `${baseUrl}/qtip/${animeId}`
    );

    return response.data.results;
  } catch (err) {
    console.error("Error fetching qtip info:", err);
    return null;
  }
};

export default getQtip;
