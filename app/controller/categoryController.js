const { GeneralResponse } = require('../helper/response');
const { StatusCodes } = require('http-status-codes');
const message = require('../utils/message');
const responseStatus = require('../utils/enum');
const { categoryAddV } = require('../validations/categoryValidation');
const logger = require('../helper/logger');
const category = require('../models/categoryModel');
const { search, sort, paginate } = require('../services/commanFunction');

const categoryAdd = async (req, res) => {
  try {
    const { error, value } = categoryAddV.validate(req.body);

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

    const { category_name } = value;
    const newCategory = await category.create({ category_name });

    logger.info(`Category ${message.ADD_SUCCESS}`);

    return res
      .status(StatusCodes.CREATED)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.CREATED,
          `Category ${message.ADD_SUCCESS}`,
          { id: newCategory.id },
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

const categoryUpdate = async (req, res) => {
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
    const { error, value } = categoryAddV.validate(req.body);
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

    const { category_name } = value;
    const existingCategory = await category.findOne({
      where: { id, isDeleted: false },
    });

    if (!existingCategory) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Category ${message.NOT_FOUND}`,
          ),
        );
    }
    const updatedCategory = await category.update(
      { category_name },
      { where: { id, isDeleted: false } },
    );

    if (updatedCategory[0] === 1) {
      logger.info(`Category ${message.UPDATED_SUCCESS}`);

      return res
        .status(StatusCodes.ACCEPTED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.ACCEPTED,
            `Category ${message.UPDATED_SUCCESS}`,
          ),
        );
    }
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR}: ${error.message}`);

    return res1
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

const categoryView = async (req, res) => {
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
    const existingCategory = await category.findOne({
      where: { id: id, isDeleted: false },
    });

    if (!existingCategory) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Category ${message.NOT_FOUND}`,
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
            `Category fetch ${message.SUCCESS}`,
            existingCategory,
          ),
        );

    }
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR}: ${error.message}`);

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

const categoryDelete = async (req, res) => {
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
    const existingCategory = await category.findOne({
      where: { id, isDeleted: false },
    });

    if (!existingCategory) {

      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Category ${message.NOT_FOUND}`,
          ),
        );
    }

    const deletedCategory = await category.update(
      { isDeleted: true },
      {
        where: { id, isDeleted: false },
      },
    );

    if (deletedCategory[0] === 1) {
      logger.info(`Category ${message.IS_DELETED}`);

      return res
        .status(StatusCodes.ACCEPTED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.ACCEPTED,
            `Category ${message.IS_DELETED}`,
          ),
        );
    }
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR}: ${error.message}`);

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

const categoryList = async (req, res) => {
  try {
    const { searchKey, searchValue, sortBy, order, page, limit } = req.body;

    const categorys = await category.findAll({
      attributes: ['id', 'category_name', 'createdAt', 'updatedAt'],
      where: { isDeleted: false },
    });

    let filteredData = search(categorys, searchKey, searchValue);

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
          `Category ${message.RETRIVE_SUCCESS}`,
          {
            total: filteredData.length,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            category: paginatedData,
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
            `Category data ${message.NOT_FOUND}`,
          ),
        );
    }
  } catch (err) {
    logger.error('Error retrieving users:', err);

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
  categoryAdd,
  categoryUpdate,
  categoryView,
  categoryDelete,
  categoryList,
};
