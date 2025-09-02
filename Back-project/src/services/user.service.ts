// src/services/user.service.ts
import bcrypt from "bcrypt";
import { CompanyType } from "../enums/companyType.enum";
import { UserRole } from "../enums/userRole.enum";
import { UserStatus } from "../enums/userStatus.enum";
import User from "../models/user.model";
import Department from "../models/department.model";
import {
  InternalServerError,
  ConflictError,
  NotFoundError,
  BadRequestError,
} from "../utils/error";
import {
  CreateUserInput,
  UpdateUserProfileInput,
  GoogleProfile,
} from "../types/user.types";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS ?? 10);
const norm = (s: string) => s.trim().replace(/\s+/g, " ");

export class UserService {
  static async createUser(data: CreateUserInput) {
    try {
      const email = data.email?.trim().toLowerCase();
      if (!email) throw new BadRequestError("El correo electrónico es obligatorio.");
      if (!data.password?.trim()) throw new BadRequestError("La contraseña es obligatoria.");
      if (!data.first_name?.trim() || !data.last_name?.trim()) {
        throw new BadRequestError("Nombre y apellido son obligatorios.");
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) throw new ConflictError("El correo electrónico ya está en uso.");

      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

      const user = await User.create({
        first_name: norm(data.first_name),
        last_name: norm(data.last_name),
        email,
        password: hashedPassword,
        phone_number: data.phone_number ?? null,
        company: CompanyType.Externa,
        role: UserRole.Estandar,
        status: UserStatus.Activo,
      });

      const safe = await User.findByPk(user.user_id);
      return safe!;
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof ConflictError) throw error;
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El correo electrónico ya está en uso.");
      }
      throw new InternalServerError("Error al crear el usuario.");
    }
  }

  static async findById(id: string) {
    if (!id) throw new BadRequestError("El ID del usuario es obligatorio.");
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError(`Usuario con id ${id} no encontrado.`);
    return user;
  }

  static async findOrCreateGoogleUser(profile: GoogleProfile) {
    try {
      const provider = "google";
      const provider_id = profile.id;
      const email = profile.emails?.[0]?.value?.toLowerCase()?.trim();

      let user = await User.findOne({ where: { provider, provider_id } });
      if (user) return user;

      if (email) {
        const byEmail = await User.findOne({ where: { email } });
        if (byEmail) {
          byEmail.provider = provider;
          byEmail.provider_id = provider_id;
          await byEmail.save();
          return byEmail;
        }
      } else {
        throw new BadRequestError("El perfil de Google no contiene email.");
      }

      user = await User.create({
        first_name: profile.name?.givenName ? norm(profile.name.givenName) : "",
        last_name: profile.name?.familyName ? norm(profile.name.familyName) : "",
        email,
        status: UserStatus.Activo,
        company: CompanyType.Externa,
        role: UserRole.Estandar,
        provider,
        provider_id,
      });

      return user;
    } catch (error: any) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El correo o el proveedor ya está en uso.");
      }
      if (error instanceof BadRequestError) throw error;
      throw new InternalServerError("Error al procesar el usuario de Google.");
    }
  }

  static async findOneByRole(role: UserRole) {
    return User.findOne({ where: { role } });
  }

  static async createAdminFromGoogleProfile(profile: GoogleProfile) {
    try {
      const existing = await this.findOneByRole(UserRole.Administrador);
      if (existing) throw new ConflictError("Ya existe un usuario admin.");

      const email = profile.emails?.[0]?.value?.toLowerCase()?.trim() ?? "";
      const adminUser = await User.create({
        first_name: profile.name?.givenName ? norm(profile.name.givenName) : "",
        last_name: profile.name?.familyName ? norm(profile.name.familyName) : "",
        email,
        status: UserStatus.Activo,
        company: CompanyType.Externa,
        role: UserRole.Administrador,
        provider: "google",
        provider_id: profile.id,
      });

      return adminUser;
    } catch (error: any) {
      if (error instanceof ConflictError) throw error;
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El correo o el proveedor ya está en uso.");
      }
      throw new InternalServerError("Error al crear el usuario administrador.");
    }
  }

  static async completeUserProfile(userId: string, profileData: UpdateUserProfileInput) {
    try {
      const user = await this.findById(userId);

      if (profileData.phone_number !== undefined) {
        const existingPhone = await User.findOne({
          where: { phone_number: profileData.phone_number },
        });
        if (existingPhone && existingPhone.user_id !== userId) {
          throw new ConflictError("Número de teléfono ya en uso.");
        }
        user.phone_number = profileData.phone_number ?? null;
      }

      if (profileData.password !== undefined) {
        if (!profileData.password.trim()) {
          throw new BadRequestError("La contraseña no puede estar vacía.");
        }
        user.password = await bcrypt.hash(profileData.password, SALT_ROUNDS);
      }

      if (profileData.department_id === null) {
        user.department_id = null;
      } else if (profileData.department_id !== undefined) {
        const department = await Department.findByPk(profileData.department_id);
        if (!department) throw new NotFoundError("Departamento no encontrado.");
        user.department_id = profileData.department_id;
      }

      if (profileData.company !== undefined) {
        user.company = profileData.company;
      }

      await user.save();

      const { password, ...userWithoutPassword } = user.get({ plain: true }) as any;
      return userWithoutPassword;
    } catch (error: any) {
      if (
        error instanceof ConflictError ||
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      ) throw error;

      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("Campo único ya está en uso.");
      }

      throw new InternalServerError("Error al completar el perfil.");
    }
  }
}
