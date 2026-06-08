import mongoose from "mongoose";

export default async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado ao Mongo");
  } catch (error) {
    console.error("Erro: ", error.message);
  }
};
