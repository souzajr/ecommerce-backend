import PasswordValidator from 'password-validator';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import cepValidator from 'cep-promise';
import validator from 'validator';
import Plan from '../../models/plan.model';
import User from '../../models/user.model';
import Product from '../../models/product.model';
import Ecommerce from '../../models/ecommerce.model';

export function existOrError(value: string, msg: string) {
  if (!value) throw msg;
  if (Array.isArray(value) && value.length === 0) throw msg;
  if (typeof value === 'string' && !value.trim()) throw msg;
}

export function notExistOrError(value: string, msg: string) {
  try {
    existOrError(value, msg);
  } catch {
    return;
  }

  throw msg;
}

export function isIntegerOrError(value: number, msg: string) {
  if (!Number.isInteger(Number(value)) || Number(value) < 0) throw msg;
}

export function isIntegerPositiveOrError(value: number, msg: string) {
  if (!Number.isInteger(Number(value)) || Number(value) <= 0) throw msg;
}

export function isBooleanOrError(value: boolean, msg: string) {
  if (typeof value !== 'boolean') throw msg;
}

export function tooSmall(value: string, msg: string) {
  if (value.length < 10) throw msg;
}

export function tooBig(value: string, msg: string) {
  if (value.length > 50) throw msg;
}

export function tooBigEmail(value: string, msg: string) {
  if (value.length > 100) throw msg;
}

export function equalsOrError(valueA: string, valueB: string, msg: string) {
  if (valueA !== valueB) throw msg;
}

export function strongOrError(value: string, msg: string, size: number) {
  const schema = new PasswordValidator();
  if (!schema.is().min(size).validate(value)) throw msg;
}

export function hasDigitOrError(value: string, msg: string) {
  const schema = new PasswordValidator();
  if (!schema.has().digits().validate(value)) throw msg;
}

export function hasUpperOrError(value: string, msg: string) {
  const schema = new PasswordValidator();
  if (!schema.has().uppercase().validate(value)) throw msg;
}

export function hasLowerOrError(value: string, msg: string) {
  const schema = new PasswordValidator();
  if (!schema.has().lowercase().validate(value)) throw msg;
}

export function notSpaceOrError(value: string, msg: string) {
  const schema = new PasswordValidator();
  if (schema.has().spaces().validate(value)) throw msg;
}

export function hasSpecialOrError(value: string, msg: string) {
  const schema = new PasswordValidator();
  if (!schema.has().symbols().validate(value)) throw msg;
}

export function notSpecialOrError(value: string, msg: string) {
  const schema = new PasswordValidator();
  if (schema.has().symbols().validate(value)) throw msg;
  if (value.includes('/')) throw msg;
}

export function validEmailOrError(value: string, msg: string) {
  const validate = validator.isEmail(value);
  if (!validate) throw msg;
}

export function notDigitOrError(value: string, msg: string) {
  const schema = new PasswordValidator();
  if (schema.has().digits().validate(value)) throw msg;
}

export function notUpperOrError(value: string, msg: string) {
  const schema = new PasswordValidator();
  if (schema.has().uppercase().validate(value)) throw msg;
}

export function validateCPF(value: string, msg: string) {
  const validate = cpf.isValid(value);
  if (!validate) throw msg;
}

export function validateCNPJ(value: string, msg: string) {
  const validate = cnpj.isValid(value);
  if (!validate) throw msg;
}

export function validadeDocument(type: string, value: string, msg: string) {
  if (type === 'pf') {
    return validateCPF(value, msg);
  }

  return validateCNPJ(value, msg);
}

export async function validCepOrError(
  value: string,
  msg: string
): Promise<any> {
  try {
    await cepValidator(value);
  } catch {
    throw msg;
  }
}

export function validURLOrError(value: string, msg: string) {
  const validate = validator.isURL(value, { require_valid_protocol: false });
  if (!validate) throw msg;
}

export async function checkIfUserAlreadyExist(
  value: string,
  msg: string
): Promise<any> {
  const check = await User.exists({ email: value }).lean();

  if (check) throw msg;
}

export async function checkIfDomainAlreadyExist(
  value: string,
  msg: string
): Promise<any> {
  const check = await Ecommerce.exists({ url: value }).lean();

  if (check) throw msg;
}

export async function checkIfPlanAlreadyExist(
  value: string,
  msg: string
): Promise<any> {
  const check = await Plan.exists({ name: value }).lean();

  if (check) throw msg;
}

export async function checkIfProductAlreadyExist(
  ecommerce: string,
  value: string,
  msg: string
): Promise<any> {
  const check = await Product.exists({ ecommerce, url: value }).lean();

  if (check) throw msg;
}

export async function checkIfIsAllowedType(
  ecommerce: string,
  type: string,
  msg: string
): Promise<any> {
  if (type !== 'physical' && type !== 'digital' && type !== 'course') {
    throw msg;
  }

  const getEcommerce = await Ecommerce.findOne({ _id: ecommerce })
    .populate('plan')
    .lean();

  if (!getEcommerce) {
    throw msg;
  }

  if (!getEcommerce.plan?.type) {
    throw msg;
  }

  if (getEcommerce.plan.type === 'physical' && type === 'digital') {
    throw msg;
  }

  if (getEcommerce.plan.type === 'physical' && type === 'course') {
    throw msg;
  }

  if (getEcommerce.plan.type === 'digital' && type === 'course') {
    throw msg;
  }
}

export function checkType(type: string, msg: string) {
  if (!type) {
    throw msg;
  }

  if (type !== 'physical' && type !== 'digital' && type !== 'course') {
    throw msg;
  }
}

export const validateFileFormat = (
  name: string,
  disiredFormat: 'file' | 'image'
): boolean => {
  const regex =
    disiredFormat === 'file'
      ? new RegExp('(.*?).(rar|zip)$')
      : new RegExp('(.*?).(jpg|jpeg|png|webp)$');

  return regex.test(name);
};

export const validateSize = (size: number, type: 'file' | 'image'): boolean => {
  if (!size || size <= 0) {
    return false;
  }

  if (type === 'file') {
    if (size <= 25e6) {
      // 25MB
      return true;
    }

    return false;
  }

  if (size <= 1e6) {
    // 1MB
    return true;
  }

  return false;
};
