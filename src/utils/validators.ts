import { EMAIL_REGEX } from '@constants/reg';
import { CreateFavouriteBookInput, ChangePasswordInput, CreateAuthorInput, CreateBookInput, CreateCategoryInput, CreateFeatureInput, CreatePublisherInput, MutationLoginInput, RegisterInput, UpdateAuthorInput, UpdateBookInput, UpdateCategoryInput, UpdateFeatureInput, UpdatePublisherInput, VerifyEmailInput } from '@graphql/types/generated-graphql-types';
import { isNaN } from 'lodash';

export const validatorRegister = (input: RegisterInput) => {
  const { email, password, firstName, lastName } = input;

  let error: any = {};
  if (firstName.trim().length === 0) {
    error.message = 'firstName is required';
  } else if (lastName.trim().length === 0) {
    error.message = 'lastName is required';
  } else if (email.trim().length === 0) {
    error.message = 'email is required';
  } else if (!email.match(EMAIL_REGEX)) {
    error.message = 'email is invalid';
  } else if (password.trim().length === 0) {
    error.message = 'password is required';
  } else if (password.trim().length < 6) {
    error.message = 'password must be at least 6 characters';
  } else error = {};

  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorLogin = (input: MutationLoginInput) => {
  const { email, password } = input;

  let error: any = {};
  if (email.trim().length === 0) {
    error.message = 'email is required';
  } else if (!email.match(EMAIL_REGEX)) {
    error.message = 'email is invalid';
  } else if (password.trim().length === 0) {
    error.message = 'password is required';
  } else if (password.trim().length < 6) {
    error.message = 'password must be at least 6 characters';
  } else error = {};

  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorCreatBook = (input: CreateBookInput | UpdateBookInput) => {
  const { description, title, isbn, price, releasedDate, bookType } = input;

  let error: any = {};
  if (title.trim().length === 0) {
    error.message = 'title is required';
  } else if (title.trim().length > 255) {
    error.message = ' Max 255 alphanumeric characters';
  } else if (description.trim().length === 0) {
    error.message = 'description is required';
  } else if (isbn.trim().length === 0) {
    error.message = 'isbn is required';
  } else if (isNaN(price)) {
    error.message = 'Price must be a number';
  } else if (!bookType) {
    error.message = 'Book type is required';
  } else error = {};
  // else if (!isDate(relasedDate)) {
  //   error.message = 'Relased Date must be a Date';
  // }
  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorVerifyEmail = (input: VerifyEmailInput) => {
  const { email, otp } = input;
  let error: any = {};
  if (email.trim().length === 0) {
    error.message = 'email is required';
  } else if (!email.match(EMAIL_REGEX)) {
    error.message = 'email is invalid';
  } else if (otp.trim().length === 0) {
    error.message = 'password is required';
  } else if (otp.trim().length !== 4) {
    error.message = 'otp is invalid';
  } else error = {};
  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorResendOTP = (email: string) => {
  let error: any = {};
  if (email.trim().length === 0) {
    error.message = 'email is required';
  } else if (!email.match(EMAIL_REGEX)) {
    error.message = 'email is invalid';
  }
  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorCreateCategory = (input: CreateCategoryInput) => {
  const { description, name } = input;

  let error: any = {};
  if (name.trim().length === 0) {
    error.message = 'name is required';
  } else if (name.trim().length > 100) {
    error.message = ' Max 100 alphanumeric characters';
  } else if (description.trim().length === 0) {
    error.message = 'description is required';
  } else error = {};

  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorCreatePublisher = (input: CreatePublisherInput | UpdatePublisherInput) => {
  const { description, name, address, logo, registedDate } = input;

  let error: any = {};
  if (name.trim().length === 0) {
    error.message = 'name is required';
  } else if (name.trim().length > 100) {
    error.message = ' Max 100 alphanumeric characters';
  } else if (description.trim().length === 0) {
    error.message = 'description is required';
  } else if (address.trim().length === 0) {
    error.message = 'address is required';
  } else if (!logo) {
    error.message = 'logo is required';
  } else error = {};

  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorCreateAuthor = (input: CreateAuthorInput | UpdateAuthorInput) => {
  const { name, gender, dateOfBirth } = input;

  let error: any = {};
  if (name.trim().length === 0) {
    error.message = 'name is required';
  } else if (name.trim().length > 100) {
    error.message = ' Max 100 alphanumeric characters';
  } else if (gender.trim().length === 0) {
    error.message = 'address is required';
  } else if (dateOfBirth.trim().length === 0) {
    error.message = 'Date of birth is required';
  } else error = {};

  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorUpdateCategory = (input: UpdateCategoryInput) => {
  const { description, name } = input;

  let error: any = {};
  if (name.trim().length === 0) {
    error.message = 'name is required';
  } else if (name.trim().length > 100) {
    error.message = ' Max 100 alphanumeric characters';
  } else if (description.trim().length === 0) {
    error.message = 'description is required';
  } else error = {};

  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorFeatureInput = (input: CreateFeatureInput | UpdateFeatureInput) => {
  const { title, description, coverPhoto, books, type, link } = input;
  let error: any = {};
  if (title.trim().length === 0) {
    error.message = 'title is required';
  } else if (title.trim().length > 255) {
    error.message = ' Max 255 alphanumeric characters';
  } else if (description.trim().length === 0) {
    error.message = 'description is required';
  } else if (!coverPhoto) {
    error.message = 'coverPhoto is required';
  } else if (!type) {
    error.message = 'type is required';
  } else if (!link) {
    error.message = 'link is required';
  } else error = {};
  // else if (!isDate(relasedDate)) {
  //   error.message = 'Relased Date must be a Date';
  // }
  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorChangePassword = (input: ChangePasswordInput) => {
  const { oldPassword, newPassword } = input;

  let error: any = {};
  if (newPassword.trim().length === 0) {
    error.message = 'new password is required';
  } else if (newPassword.trim().length < 6) {
    error.message = 'new password must be at least 6 characters';
  } else if (oldPassword.trim().length === 0) {
    error.message = 'Old password is required';
  } else if (oldPassword.trim().length < 6) {
    error.message = 'Old password must be at least 6 characters';
  } else error = {};

  return { error, isValid: Object.keys(error).length < 1 };
};

export const validatorFavourite = (input: CreateFavouriteBookInput) => {
  const { bookId } = input;
  let error: any = {};
  if (bookId.trim().length === 0) {
    error.message = 'bookId is required';
  } else error = {};

  return { error, isValid: Object.keys(error).length < 1 };
};
