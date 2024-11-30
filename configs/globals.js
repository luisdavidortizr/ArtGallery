require("dotenv").config();
// Global configurations object contains Application Level variables such as:
// client secrets, passwords, connection strings, and misc flags
const configurations = {
  ConnectionStrings: {
    MongoDB: "mongodb+srv://luisdavidortizr:Luisdavid123@cluster0.ynzoi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  },
  Authentication: {
    facebook: {
      ClientId: "928425282539377",
      ClientSecret: "4b9c66fbf6cce3d687e49ca0f1a1d3bf",
      CallbackUrl: "http://localhost:3000/facebook/callback"
    },
    github: {
      ClientId: "Ov23liqJfQ6DWyaWB3Sx",
      ClientSecret: "8c28493b8e52a2cb19a14e41032fb2a424dd31ed",
      CallbackUrl: "http://localhost:3000/github/callback"
    }
  },
};
module.exports = configurations;
