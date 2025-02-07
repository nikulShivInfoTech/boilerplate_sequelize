const { GeneralResponse } = require('../helper/response');
const { StatusCodes } = require('http-status-codes');
const message = require('../utils/message');
const responseStatus = require('../utils/enum');
const logger = require('../helper/logger');
const { sequelize } = require('../helper/db');
const {
  productValidation,
  productCommon,
} = require('../validations/productValidation');
const { product, categoryModel, imagesModel } = require('../services/db');
const { search, sort, paginate } = require('../services/commanFunction');

const uploadProductImages = async (productId, imagePaths) => {
  try {
    const imagePromises = imagePaths.map((image) => {
      return imagesModel.create({
        image: image,
        product_id: productId,
      });
    });

    await Promise.all(imagePromises);
  } catch (error) {
    logger.error(`${message.ERR_IMAGE_UPLOAD}`, error);
    throw new Error(`${message.ERR_IMAGE_UPLOAD}`);
  }
};

const productAdd = async (req, res) => {
  try {
    const { error, value } = productValidation.validate(req.body, {
      allowUnknown: true,
    });

    if (error) {
      logger.error(error.details[0].message);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
          ),
        );
    }

    const { product_name, category_id } = value;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => `${file.filename}`);
    }

    const newProduct = await product.create({
      product_name,
      category_id,
    });

    if (imagePaths.length > 0) {
      await uploadProductImages(newProduct.id, imagePaths);
    }

    logger.info(`Product ${message.ADD_SUCCESS}`);

    return res
      .status(StatusCodes.CREATED)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.CREATED,
          `Product ${message.ADD_SUCCESS}`,
          { id: newProduct.id, images: imagePaths },
        ),
      );
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR}`, error);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
        ),
      );
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const productData = await product.findOne({
      where: {
        id,
      },
      attributes: ['id', 'product_name'],
      include: [
        {
          model: require('../services/db').categoryModel,
          as: 'category',
          attributes: ['id', 'category_name'],
        },
        {
          model: require('../services/db').imagesModel,
          as: 'images',
          attributes: ['id', 'image'],
        },
      ],
    });

    if (!productData) {
      logger.warn(`Product  ${message.NOT_FOUND}`);

      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Product ${message.NOT_FOUND}`,
          ),
        );
    } else {
      logger.info(`Category fetch ${message.SUCCESS}`);

      return res
        .status(StatusCodes.OK)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.OK,
            `Product fetch ${message.SUCCESS}`,
            productData,
          ),
        );

    }
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR}`, error);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
        ),
      );

  }
};

const productList = async (req, res) => {
  try {
    const { searchKey, searchValue, sortBy, order, page, limit } = req.body;

    const products = await product.findAll({
      where: { isDeleted: false },
      attributes: ['id', 'product_name', 'createdAt'],
      include: [
        {
          model: categoryModel,
          as: 'category',
          attributes: ['id', 'category_name'],
        },
        {
          model: imagesModel,
          as: 'images',
          attributes: ['id', 'image'],
        },
      ],
    });

    let filteredData = search(products, searchKey, searchValue);
    filteredData = sort(filteredData, sortBy, order);
    const paginatedData = paginate(
      filteredData,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 10,
    );

    if (paginatedData.length > 0) {

      return res.status(StatusCodes.OK).json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Products ${message.RETRIVE_SUCCESS}`,
          {
            total: filteredData.length,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            products: paginatedData,
          },
        ),
      );

    } else {

      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Product data ${message.NOT_FOUND}`,
          ),
        );

    }
  } catch (error) {
    logger.error('Error retrieving products:', error);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
        ),
      );
  }
};

const addProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const product_id = id;

    let imagePaths = [];

    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => `${file.filename}`);
    }

    if (imagePaths.length > 0) {

      await uploadProductImages(product_id, imagePaths);

    } else {
      return res
        .status(StatusCodes.NO_CONTENT)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NO_CONTENT,
            `${message.NO_CONTENT} of image`,
          ),
        );
    }
    
    return res
      .status(StatusCodes.OK)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Products image ${message.ADD_SUCCESS}`,
          { product_id, images: imagePaths },
        ),
      );

  } catch (error) {
    logger.error('Error retrieving products:', error);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
        ),
      );
  }
};

const productUpdate = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    logger.error(`${message.ID_REQUIRED}`);

    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          `${message.ID_REQUIRED}`,
        ),
      );
  }

  try {
    const { error, value } = productCommon.validate(req.body);
    if (error) {
      logger.error(error.details[0].message);

      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
          ),
        );

    }

    const { product_name } = value;
    const existingProduct = await product.findOne({
      where: { id, isDeleted: false },
    });

    if (!existingProduct) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Product ${message.NOT_FOUND}`,
          ),
        );
    }

    const updatedProduct = await product.update(
      { product_name },
      { where: { id, isDeleted: false } },
    );

    if (updatedProduct[0] === 1) {
      logger.info(`Product ${message.UPDATED_SUCCESS}`);

      return res
        .status(StatusCodes.ACCEPTED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.ACCEPTED,
            `Product ${message.UPDATED_SUCCESS}`,
          ),
        );

    }
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR}`, error);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
        ),
      ); 
  }
};

const productDelete = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    logger.error(`${message.ID_REQUIRED}`);

    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          `${message.ID_REQUIRED}`,
        ),
      );

  }
  try {
    const existingProduct = await product.findOne({
      where: { id, isDeleted: false },
    });

    if (!existingProduct) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Product ${message.NOT_FOUND}`,
          ),
        );
    }

    const updatedProduct = await product.update(
      { isDeleted: true },
      { where: { id, isDeleted: false } },
    );

    if (updatedProduct[0] === 1) {
      logger.info(`Product ${message.IS_DELETED}`);

      return res
        .status(StatusCodes.OK)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.OK,
            `Product ${message.IS_DELETED}`,
          ),
        );
    }
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR}`, error);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
        ),
      );
  }
};

module.exports = {
  productAdd,
  getProductById,
  productList,
  addProductImage,
  productUpdate,
  productDelete,
};
