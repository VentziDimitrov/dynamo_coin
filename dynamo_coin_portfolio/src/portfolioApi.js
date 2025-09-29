import axios from "axios";

class PortfolioApi {
  constructor(baseURL = "http://localhost:5260/api") {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  async upload(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.client.post("/portfolio/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  }

  async refresh() {
    const response = await this.client.get(`/portfolio/refresh`);
    return response.data;
  }

  async analyseCoin(coinSymbol) {
    console.log("coinSymbol: ", coinSymbol);
    const url = `/portfolio/analyse?coin=${encodeURIComponent(coinSymbol.toLowerCase())}`;
    console.log("url: ", url);
    const response = await this.client.get(url);
    return response.data.openAiAnalysis;
  }
}

export default new PortfolioApi();
