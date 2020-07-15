import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

/**
 * Creates the default axios object to access the backend.
 */

export default axios.create({
  baseURL: "http://huskyhunties.zappa.xyz/",
  // the IP below is like localhost, but for an emulated device on
  // the same wifi network as your computer
  //baseURL: "http://10.0.2.2:3000/",
  responseType: "json",
});
