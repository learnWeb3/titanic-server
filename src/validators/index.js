const isEmail = require("validator/lib/isEmail");
const isEmpty = require("validator/lib/isEmpty");

const validateBoolean = (value) => {
  const errors = [];
  value !== true && value !== false && errors.push("value is an invalid email");
  return {
    errors,
    valid: errors.length === 0,
  };
};

const validateNumeric = (value) => {
  const errors = [];
  isNaN(value) && errors.push("value is an invalid email");
  return {
    errors,
    valid: errors.length === 0,
  };
};

const validateEmailFormat = (value) => {
  const errors = [];
  !isEmail(value) && errors.push("value is an invalid email");
  return {
    errors,
    valid: errors.length === 0,
  };
};

const validateContainsSpecialChars = (value) => {
  const errors = [];
  value &&
    typeof value === "string" &&
    !/[^A-Za-z0-9éèàù]+/.test(value) &&
    errors.push("value must contain special characters");
  return {
    errors,
    valid: errors.length === 0,
  };
};

const validateContainsCapitalLetters = (value) => {
  const errors = [];
  value &&
    typeof value === "string" &&
    !/[A-Z]+/.test(value) &&
    errors.push("value must contain capital letters");
  return {
    errors,
    valid: errors.length === 0,
  };
};

const validateContainsLowerCaseLetters = (value) => {
  const errors = [];
  value &&
    typeof value === "string" &&
    !/[a-z]+/.test(value) &&
    errors.push("value must contain lowercased letters");
  return {
    errors,
    valid: errors.length === 0,
  };
};

const validateContainsNumber = (value) => {
  const errors = [];
  value &&
    typeof value === "string" &&
    !/[0-9]+/.test(value) &&
    errors.push("value must contain number");
  return {
    errors,
    valid: errors.length === 0,
  };
};

const validateNotEmpty = (value) => {
  const errors = [];
  switch(typeof value){
    case "string":
      (!value || isEmpty(value)) && errors.push("value must not be empty");
      break;
    case "object":
      if(Array.isArray(value)){
       ( !value || !value.length) && errors.push("value must not be empty");
      }else{
        (!value || !Object.keys(value).length) && errors.push("value must not be empty");
      }
      break;
    default: 
      errors.push("value type is invalid");
      break;
  }
  return {
    errors,
    valid: errors.length === 0,
  };
};

const validateNotNull = (value) => {
  const errors = [];
  (value === null || value === "" || value === 0) &&
    errors.push("value must not be empty");
  return {
    errors,
    valid: errors.length === 0,
  };
};

const validateDate = (value) => {
  const errors = [];
  if (value) {
    const regex = new RegExp(
      /^\d{4}-[0-1][0-2]-[0-3]\d\s([0-1][0-9]|2[0-3]):[0-5]\d$/
    );
    if (value.match(regex) === null || value.match(regex) === undefined) {
      errors.push("value is an invalid date");
    }
  } else {
    errors.push("value is an invalid date");
  }
  return {
    errors,
    valid: errors.length === 0,
  };
};

const mergeValidate = (value, validations) => {
  let mergedErrors = [];

  validations.map((validation) => {
    if (typeof value === "object" && value !== null) {
      const { errors } = validation(...value);
      mergedErrors = [...mergedErrors, ...errors];
    } else {
      const { errors } = validation(value);
      mergedErrors = [...mergedErrors, ...errors];
    }
  });

  return {
    errors: mergedErrors,
    valid: mergedErrors.length === 0,
  };
};

const validatePassword = (value) =>
  mergeValidate(value, [
    validateNotNull,
    validateNotEmpty,
    validateContainsSpecialChars,
    validateContainsCapitalLetters,
    validateContainsLowerCaseLetters,
    validateContainsNumber,
  ]);

const validateEmail = (value) =>
  mergeValidate(value, [
    validateNotNull,
    validateNotEmpty,
    validateEmailFormat,
  ]);

module.exports = {
  validateContainsCapitalLetters,
  validateContainsLowerCaseLetters,
  validateContainsNumber,
  validateContainsSpecialChars,
  validateDate,
  validateEmail,
  validateNotEmpty,
  validateNotNull,
  mergeValidate,
  validateEmail,
  validatePassword,
  validateNumeric,
  validateBoolean
};
