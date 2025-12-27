import foodModel from "../models/food.model.js";
import { uploadFile } from "../services/storage.service.js";
import { v4 as uuidv4 } from "uuid";

export const createFood = async (req, res) => {
  const fileUploadResult = await uploadFile(req.file.buffer, uuidv4());

  const foodItem = await foodModel.create({
    name: req.body.name,
    description: req.body.description,
    video: fileUploadResult.url,
    foodPartner: req.foodPartner._id,
  });

  res.status(201).json({
    message: "food created successfully",
    food: foodItem,
  });
};

