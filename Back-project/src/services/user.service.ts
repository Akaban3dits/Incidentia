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
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser)
      throw new ConflictError("El correo electrónico ya está en uso.");

    try {
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

      const user = await User.create({
        first_name: norm(data.first_name),
        last_name: norm(data.last_name),
        email: data.email,
        password: hashedPassword,
        phone_number: data.phone_number ?? null,
        company: data.company ?? null,
        role: data.role ?? UserRole.Estandar,
        status: UserStatus.Activo,
        department_id: data.department_id ?? null,
      });

      return await User.findByPk(user.user_id);
    } catch (error: any) {
      if (
        error?.name === "SequelizeUniqueConstraintError" ||
        error?.original?.code === "23505"
      ) {
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

  static async findByEmailWithPassword(email: string) {
    const user = await User.scope("withPassword").findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) throw new NotFoundError("Usuario no encontrado.");
    return user;
  }

  static async findOrCreateGoogleUser(profile: GoogleProfile) {
    const provider = "google";
    const provider_id = profile.id;
    const email = profile.emails?.[0]?.value?.toLowerCase()?.trim();

    if (!email)
      throw new BadRequestError("El perfil de Google no contiene email.");

    try {
      return await (User.sequelize as any).transaction(async (t: any) => {
        let user = await User.findOne({
          where: { provider, provider_id },
          transaction: t,
        });
        if (user) return user;

        user = await User.findOne({ where: { email }, transaction: t });
        if (user) {
          user.provider = provider;
          user.provider_id = provider_id;
          await user.save({ transaction: t });
          return user;
        }

        const first = profile.name?.givenName
          ? norm(profile.name.givenName)
          : "";
        const last = profile.name?.familyName
          ? norm(profile.name.familyName)
          : "";

        const created = await User.create(
          {
            first_name: first,
            last_name: last,
            email,
            status: UserStatus.Activo,
            role: UserRole.Estandar,
            provider,
            provider_id,
          },
          { transaction: t }
        );

        return created;
      });
    } catch (error: any) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El correo o el proveedor ya está en uso.");
      }
      if (error instanceof BadRequestError) throw error;
      throw new InternalServerError("Error al procesar el usuario de Google.");
    }
  }

  static async findOneByRole(role: UserRole, onlyActive = false) {
    const scopes = onlyActive ? ["active"] : [];
    return User.scope(scopes).findOne({ where: { role } });
  }

  static async createAdminFromGoogleProfile(profile: GoogleProfile) {
    const provider = "google";
    const provider_id = profile.id;
    const email = profile.emails?.[0]?.value?.toLowerCase()?.trim();

    if (!email)
      throw new BadRequestError("El perfil de Google no contiene email.");

    try {
      return await (User.sequelize as any).transaction(async (t: any) => {
        const existingAdmin = await this.findOneByRole(UserRole.Administrador);
        if (existingAdmin) {
          throw new ConflictError("Ya existe un usuario admin.");
        }

        let user = await User.findOne({
          where: { provider, provider_id },
          transaction: t,
        });
        if (user) {
          if (user.role !== UserRole.Administrador) {
            user.role = UserRole.Administrador;
            await user.save({ transaction: t });
          }
          return user;
        }

        user = await User.findOne({ where: { email }, transaction: t });
        if (user) {
          user.provider = provider;
          user.provider_id = provider_id;
          user.role = UserRole.Administrador;
          user.status = UserStatus.Activo;
          await user.save({ transaction: t });
          return user;
        }

        const first = profile.name?.givenName
          ? norm(profile.name.givenName)
          : "";
        const last = profile.name?.familyName
          ? norm(profile.name.familyName)
          : "";

        const adminUser = await User.create(
          {
            first_name: first,
            last_name: last,
            email,
            status: UserStatus.Activo,
            role: UserRole.Administrador,
            provider,
            provider_id,
          },
          { transaction: t }
        );

        return adminUser;
      });
    } catch (error: any) {
      if (error instanceof ConflictError) throw error;
      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("El correo o el proveedor ya está en uso.");
      }
      if (error instanceof BadRequestError) throw error;
      throw new InternalServerError("Error al crear el usuario administrador.");
    }
  }

  static async completeUserProfile(
    userId: string,
    profileData: UpdateUserProfileInput
  ) {
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

      const { password, ...userWithoutPassword } = user.get({
        plain: true,
      }) as any;
      return userWithoutPassword;
    } catch (error: any) {
      if (
        error instanceof ConflictError ||
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      )
        throw error;

      if (error?.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("Campo único ya está en uso.");
      }

      throw new InternalServerError("Error al completar el perfil.");
    }
  }

  static async listDeptAdmins(department_id: number) {
    const admins = await User.scope([
      "active",
      { method: ["byDepartment", department_id] },
      { method: ["byRole", UserRole.Administrador] },
    ]).findAll({ attributes: ["user_id", "first_name", "last_name", "email"] });

    return admins;
  }

  static async searchUsers(opts: {
    q?: string;
    department_id?: number;
    role?: UserRole;
    status?: UserStatus;
    page?: number;
    pageSize?: number;
    recent?: boolean;
  }) {
    const scopes: any[] = [];
    if (opts.q) scopes.push({ method: ["search", opts.q] });
    if (opts.department_id !== undefined)
      scopes.push({ method: ["byDepartment", opts.department_id] });
    if (opts.role) scopes.push({ method: ["byRole", opts.role] });
    if (opts.status) scopes.push({ method: ["byStatus", opts.status] });
    if (opts.recent) scopes.push("recent");

    const page = Math.max(1, opts.page ?? 1);
    const pageSize = Math.max(1, Math.min(200, opts.pageSize ?? 20));

    return User.scope(scopes).findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
  }

  static async delete(userId: string) {
    try {
      const user = await this.findById(userId);
      await user.destroy();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        throw new ConflictError(
          "No se puede eliminar: hay registros asociados a este usuario."
        );
      }
      throw new InternalServerError("Error al eliminar el usuario.");
    }
  }
}
