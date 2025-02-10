const { GeneralResponse } = require('../helper/response');
const { StatusCodes } = require('http-status-codes');
const message = require('../utils/message');
const responseStatus = require('../utils/enum');
const logger = require('../helper/logger');
const testimonialModel = require('../models/testimonialModel');
const { search, sort, paginate } = require('../services/commanFunction');

const {
  testimonialValidation,
} = require('../validations/testimonialValidation');

const addTestimonial = async (req, res) => {
  const { error, value } = testimonialValidation.validate(req.body);

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
  try {
    const { name, description, rating } = value;

    const testimonialCreate = await testimonialModel.create({
      name,
      description,
      rating,
    });

    if (!testimonialCreate) {
      logger.error(`${message.FAILED_TO_CREATE} testimonial`);

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            `${message.FAILED_TO_CREATE} testimonial`,
          ),
        );
    } else {
      logger.info(`Testimonial ${message.ADD_SUCCESS}`);

      return res
        .status(StatusCodes.CREATED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.CREATED,
            `Testimonial ${message.ADD_SUCCESS}`,
            { id: testimonialCreate.id },
          ),
        );

    }
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR} ${error}`);

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

const viewTestimonial = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.error(`${message.ID_REQUIRED}`)

    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          message.ID_REQUIRED,
        ),
      );
  }

  const testimonialId = Number(id);
  if (isNaN(testimonialId)) {
  logger.error(`${message.INVALID_ID}`)

    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          `${message.INVALID_ID}`,
        ),
      );
  }

  try {
    const testimonialView = await testimonialModel.findOne({
      where: { id: testimonialId, isDeleted: false },
      attributes: ['name', 'description', 'rating'],
    });

    if (!testimonialView) {
      logger.error(`Testimonial ${message.NOT_FOUND}`);
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Testimonial ${message.NOT_FOUND}`,
          ),
        );
    } else {
      logger.info(`Testimonial ${message.RETRIVE_SUCCESS}`);
      return res
        .status(StatusCodes.OK)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.OK,
            `Testimonial ${message.RETRIVE_SUCCESS}`,
            testimonialView,
          ),
        );
    }
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR} ${error}`);
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

const editTestimonial = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.error(`${message.ID_REQUIRED}`)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          message.ID_REQUIRED,
        ),
      );
  }

  const testimonialId = Number(id);
  if (isNaN(testimonialId)) {
    logger.error(`${message.INVALID_ID}`)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          `${message.INVALID_ID}`,
        ),
      );
  }

  try {
    const isTestimonialAvailable = await testimonialModel.findOne({
      where: { id, isDeleted: false },
    });

    if (!isTestimonialAvailable) {
        logger.error(`Testimonial ${message.NOT_FOUND}`)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Testimonial ${message.NOT_FOUND}`,
          ),
        );
    }

    const { error, value } = testimonialValidation.validate(req.body);

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

    const { name, description, rating } = value;

    const updateTestimonial = await testimonialModel.update(
      { name, description, rating },
      { where: { id, isDeleted: false } },
    );

    if (updateTestimonial[0] === 1) {
      logger.info(`Testimonial ${message.UPDATED_SUCCESS}`);

      return res
        .status(StatusCodes.ACCEPTED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.ACCEPTED,
            `Testimonial ${message.UPDATED_SUCCESS}`,
          ),
        );
    } else {
      logger.error(`${WENT_WRONG}`);

      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `${WENT_WRONG}`,
          ),
        );
    }
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR} ${error}`);
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

const deleteTestimonial = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.error(`${message.ID_REQUIRED}`)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          message.ID_REQUIRED,
        ),
      );
  }

  const testimonialId = Number(id);
  if (isNaN(testimonialId)) {
    logger.error(`${message.INVALID_ID}`)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          `${message.INVALID_ID}`,
        ),
      );
  }
  try {
    const isTestimonialAvailable = await testimonialModel.findOne({
      where: { id: testimonialId, isDeleted: false },
    });

    if (!isTestimonialAvailable) {
        logger.error(`Testimonial ${message.NOT_FOUND}`)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Testimonial ${message.NOT_FOUND}`,
          ),
        );
    }

    const updatedTestimonial = await testimonialModel.update(
      { isDeleted: true },
      { where: { id, isDeleted: false } },
    );

    if (updatedTestimonial[0] === 1) {
        logger.info(`Testimonial ${message.IS_DELETED}`)
      return res
        .status(StatusCodes.ACCEPTED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.ACCEPTED,
            `Testimonial ${message.IS_DELETED}`,
          ),
        );
    } else {
      logger.error(`${WENT_WRONG}`);

      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `${WENT_WRONG}`,
          ),
        );
    }
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR} ${error}`);
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

const listTestimonial = async (req, res) => {
  try {
    const { searchKey, searchValue, sortBy, order, page, limit } = req.body;

    const testimonials = await testimonialModel.findAll({
      where: { isDeleted: false },
      attributes: ['id', 'name', 'description', 'rating', 'createdAt'],
    });

    let filteredData = search(testimonials, searchKey, searchValue);
    filteredData = sort(filteredData, sortBy, order);
    const paginatedData = paginate(
      filteredData,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 10,
    );

    if (paginatedData.length > 0) {
      logger.info(`Testimonial ${message.RETRIVE_SUCCESS}`);
      return res.status(StatusCodes.OK).json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Testimonial ${message.RETRIVE_SUCCESS}`,
          {
            total: filteredData.length,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            testimonials: paginatedData,
          },
        ),
      );
    } else {
        logger.error(`Testimonial data ${message.NOT_FOUND}`)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Testimonial data ${message.NOT_FOUND}`,
          ),
        );
    }
  } catch (error) {
    logger.error(`${ message.INTERNAL_SERVER_ERROR} ${ error}`);

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
  addTestimonial,
  viewTestimonial,
  editTestimonial,
  deleteTestimonial,
  listTestimonial,
};
