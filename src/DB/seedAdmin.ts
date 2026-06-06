import { User } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';
import bcrypt from "bcrypt";


export const seedSuperAdmin = async () => {
  async function hashPassword() {
    const hashPasswod = await bcrypt.hash(
      config.super_admin.password!,
      Number(config.bcrypt_salt_rounds)
    );
    return hashPasswod
  }
  const password = await hashPassword()
  const payload = {
    name: 'Administrator',
    email: config.super_admin.email,
    role: USER_ROLES.ADMIN,
    password,
    verified: true,
  };
  const isExistSuperAdmin = await User.findOne({
    email: config.super_admin.email,
    role: USER_ROLES.ADMIN,
  });
  if (!isExistSuperAdmin) {
    await User.create(payload);
    logger.info('✨ Super Admin account has been successfully created!');
  }
};
