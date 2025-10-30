const moment = require("moment");
const { StatusCodes } = require("http-status-codes");
const { responseStatus } = require("../config/config");
const { catchBlock } = require("../helpers/utils.helper");
const Products = require("../models/product");
const { model } = require("mongoose");
const Banners = require("../models/banners");

const getProduct = async function (req, res) {
  const input = req.body;
  const page = input.page || 1;
  const pagerow = input.pagerow || 10;
  const skip = (page - 1) * pagerow;
  let searchTearms = input.searchTearms || {};
  try {
    const conditions = [];
    for (let key in searchTearms) {
      conditions.push({ [key]: { $regex: searchTearms[key], $options: "i" } });
    }
    const query = conditions.length > 0 ? { $or: conditions } : {};

    const products = await Products.find(query).skip(skip).limit(pagerow);

    const data = products.map((products) => ({
      _id: products._id,
      name: products.name,
      price: products.price,
      product_url: `${process.env.IMAGE_URL}/images/${products.image}`,
      status: products.status,
    }));
    const totalDocumentsCount = await Products.countDocuments({ status: 1 });
    res.status(200).json({
      success: true,
      message: "success",
      data: data,
      totalDocumentsCount: totalDocumentsCount,
      totalPages: Math.ceil(totalDocumentsCount / pagerow),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      response: 0,
      status: false,
    });
    console.error(error);
  }
};

const getbanners = async function (req, res) {
  const input = req.body;
  const page = input.page || 1;
  const pagerow = input.pagerow || 10;
  const skip = (page - 1) * pagerow;
  const searchTerms = input.searchTerms || {};

  try {
    const conditions = [];
    for (let key in searchTerms) {
      conditions.push({ [key]: { $regex: searchTerms[key], $options: "i" } });
    }

    const query = conditions.length > 0 ? { $or: conditions } : {};

    const banners = await Banners.find(query).skip(skip).limit(pagerow);

    const data = banners.map((banner) => ({
      _id: banner._id,
      banner_title: banner.banner_title,
      material: `${process.env.IMAGE_URL}/images/${banner.material}`,
      status: banner.status,
    }));

    const totalDocumentsCount = await Banners.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "success",
      data: data,
      totalDocumentsCount: totalDocumentsCount,
      totalPages: Math.ceil(totalDocumentsCount / pagerow),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      response: 0,
      status: false,
    });
    console.log(error);
  }
};


module.exports = {
  getProduct: getProduct,
  getbanners: getbanners,
};
