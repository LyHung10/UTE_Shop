// config/elasticsearch.js
import { Client } from "@elastic/elasticsearch";

const elasticClient = new Client({
  node: "http://localhost:9200",
  // Nếu ES8 bật security, thêm auth ở đây:
  // auth: { username: 'elastic', password: 'xxxxx' }
});

export default elasticClient;
