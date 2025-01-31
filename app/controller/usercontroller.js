const { GeneralResponse } = require('../helper/response');
const { StatusCodes } = require('http-status-codes');
const {
  userRegistrationValidation,
  editUserValidation,
  loginValidation,
  resetPasswordvalidate,
  forgotPasswordValidation,
} = require('../validations/userValidation');
const message = require('../utils/message');
const responseStatus = require('../utils/enum');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../helper/logger');
require('dotenv').config();
const User = require('../models/userModel');
const { search, sort, paginate } = require('../services/commanFunction');
const { sendEmail } = require('../services/mailSender');
const otpModel = require('../models/otpModel');
const addUser = async (req, res) => {
  try {
    const { error } = userRegistrationValidation.validate(req.body);

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

    const {
      name,
      email,
      password,
      address,
      gender,
      dateOfBirth,
      country,
      state,
      city,
      pincode,
    } = req.body;

    const existingUser = await User.findOne({
      where: { email, isDeleted: false },
    });

    if (existingUser) {
      logger.warn(`User with email ${message.ALREADY_EXISTS}`);

      return res
        .status(StatusCodes.CONFLICT)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.CONFLICT,
            `User with email ${message.ALREADY_EXISTS}`,
          ),
        );
    }
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      gender,
      dateOfBirth,
      country,
      state,
      city,
      pincode,
    });

    logger.info(`User ${message.ADD_SUCCESS}`);

    return res
      .status(StatusCodes.CREATED)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.CREATED,
          `User ${message.ADD_SUCCESS}`,
          { id: newUser.id },
        ),
      );
  } catch (err) {
    logger.error(`${message.INTERNAL_SERVER_ERROR}`, err);

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

const viewUser = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findByPk(id, {
      attributes: [
        'id',
        'name',
        'email',
        'address',
        'gender',
        'dateOfBirth',
        'country',
        'state',
        'city',
        'pincode',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      logger.warn(`User with ID ${id} not found`);
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User with ID ${id} not found`,
          ),
        );
    }

    logger.info(`User retrieved successfully: ${user.email}`);
    return res
      .status(StatusCodes.OK)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `User data retrieved successfully`,
          user,
        ),
      );
  } catch (err) {
    logger.error(`Error retrieving user with ID ${req.params.id}`, err);
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

const listUser = async (req, res) => {
  try {
    const { searchKey, searchValue, sortBy, order, page, limit } = req.body;

    const users = await User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'address',
        'gender',
        'dateOfBirth',
        'country',
        'state',
        'city',
        'pincode',
        'createdAt',
        'updatedAt',
      ],
      where: { isDeleted: false },
    });

    let filteredData = search(users, searchKey, searchValue);

    filteredData = sort(filteredData, sortBy, order);

    const paginatedData = paginate(
      filteredData,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 10,
    );

    return res.status(StatusCodes.OK).json(
      new GeneralResponse(
        responseStatus.RESPONSE_SUCCESS,
        StatusCodes.OK,
        `Users ${message.RETRIVE_SUCCESS}`,
        {
          total: filteredData.length,
          page: parseInt(page, 10) || 1,
          limit: parseInt(limit, 10) || 10,
          users: paginatedData,
        },
      ),
    );
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

const editUser = async (req, res) => {
  const id = req.user.id;
  const { error, value } = editUserValidation.validate(req.body);

  if (error) {
    logger.info(error.details[0].message);
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

  const { name, address, gender, dateOfBirth, country, state, city, pincode } =
    value;

  try {
    const user = await User.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
          ),
        );
    }

    const updatedUser = await user.update({
      name,
      address,
      gender,
      dateOfBirth,
      country,
      state,
      city,
      pincode,
    });

    logger.info(`User updated successfully: ${updatedUser.email}`);

    return res
      .status(StatusCodes.ACCEPTED)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.ACCEPTED,
          `User ${message.UPDATED_SUCCESS}`,
        ),
      );
  } catch (err) {
    logger.error(`Error updating user: ${err}`);

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

const login = async (req, res) => {
  const { error } = loginValidation.validate(req.body);

  if (error) {
    logger.info(error.details[0].message);

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

  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        email: email,
        isDeleted: false,
      },
    });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
          ),
        );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.error(message.INVALID_CREDENTIALS);

      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.UNAUTHORIZED,
            message.INVALID_CREDENTIALS,
          ),
        );
    } else {
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '12h' },
      );
      logger.info(message.LOGIN_SUCCESS);
      return res
        .status(StatusCodes.OK)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.OK,
            message.LOGIN_SUCCESS,
            { token },
          ),
        );
    }
  } catch (err) {
    logger.error(message.INTERNAL_SERVER_ERROR, err);

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

const resetPassword = async (req, res) => {
  const id = req.user.id;
  const { error, value } = resetPasswordvalidate.validate(req.body);

  if (error) {
    logger.info(error.details[0].message);

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

  const { currentPassword, newPassword } = value;

  try {
    const user = await User.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
          ),
        );
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      logger.error(message.INCORRECT_CRNT_PASS);

      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.UNAUTHORIZED,
            message.INCORRECT_CRNT_PASS,
          ),
        );
    } else {
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      const password = hashedNewPassword;

      const updatedUserPssword = await user.update({
        password,
      });

      logger.info(`Password ${message.UPDATED_SUCCESS}`);

      return res
        .status(StatusCodes.ACCEPTED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.ACCEPTED,
            `Password ${message.UPDATED_SUCCESS}`,
          ),
        );
    }
  } catch (err) {
    logger.error(`Error updating password: ${err}`);

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

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 900000);
};

const otpSend = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();

  try {
    const subject = 'OTP for password reset';
    const text = `Your OTP for resetting the password is: ${otp}. It is valid for 5 minutes.`;

    const user = await User.findOne({
      where: {
        email,
        isDeleted: false,
      },
    });

    if (!user) {
      logger.error(`User ${message.NOT_FOUND}`);

      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
          ),
        );
    }

    const confirmationSendedMail = await sendEmail(email, subject, text);

    if (
      !confirmationSendedMail ||
      !confirmationSendedMail.response.includes('OK')
    ) {
      logger.error(`${message.FAILED_OTP_SEND}`);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `${message.FAILED_OTP_SEND}`,
          ),
        );
    }

    const user_id = user.id;
    const otpStored = await otpModel.create({ user_id, otp });

    const milliseconds = 5 * 60 * 1000;
    setTimeout(async () => {
      try {
        const result = await otpModel.destroy({ where: { user_id } });
        if (result) {
          logger.info(`Removed OTP for user ${user_id} from database.`);
        } else {
          logger.warn(`No OTP found to remove for user ${user_id}.`);
        }
      } catch (error) {
        logger.error(
          `Unable to remove OTP for user ${user_id}: ${error.message}`,
        );
      }
    }, milliseconds);

    return res
      .status(StatusCodes.CREATED)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.CREATED,
          `OTP sent ${message.SUCCESS}`,
        ),
      );
  } catch (error) {
    logger.error(`${message.INTERNAL_SERVER_ERROR}`);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          ` ${message.INTERNAL_SERVER_ERROR}`,
        ),
      );
  }
};

const forgotPassword = async (req, res) => {
  const { error, value } = forgotPasswordValidation.validate(req.body);

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
  } else {
    const { otp, newPassword } = value;
    try {
      const otpData = await otpModel.findOne({
        where: {
          otp,
        },
      });
      if (!otpData) {
        logger.error(message.OTP_EXPIRED);

        return res
          .status(StatusCodes.GONE)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.GONE,
              `${message.OTP_EXPIRED}`,
            ),
          );
      }

      const user_id = otpData.user_id;
      const user = await User.findOne({
        where: {
          id: user_id,
          isDeleted: false,
        },
      });

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.NOT_FOUND,
              `User ${message.NOT_FOUND}`,
            ),
          );
      }

      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      const updatedUser = await user.update({ password: hashedNewPassword });

      logger.info(`User password ${message.UPDATED_SUCCESS}`);

      return res
        .status(StatusCodes.ACCEPTED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.ACCEPTED,
            `User password ${message.UPDATED_SUCCESS}`,
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
            ` ${message.INTERNAL_SERVER_ERROR}`,
          ),
        );
    }
  }
};
module.exports = {
  addUser,
  viewUser,
  listUser,
  editUser,
  login,
  resetPassword,
  otpSend,
  forgotPassword,
};
