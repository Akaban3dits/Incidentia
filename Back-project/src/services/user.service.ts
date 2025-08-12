import { CompanyType } from "../enums/companyType.enum";
import { UserRole } from "../enums/userRole.enum";
import { UserStatus } from "../enums/userStatus.enum";
import User from "../models/user.model";
import Department from "../models/department.model";
import bcrypt from "bcrypt";
import {
  InternalServerError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/error";

interface GoogleProfile {
  id: string;
  emails?: { value: string }[];
  name?: { givenName: string; familyName: string };
}

export class UserService {
  static async findById(id: string) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError(`Usuario con id ${id} no encontrado.`);
    }
    return user;
  }

  static async findOrCreateGoogleUser(profile: GoogleProfile) {
    let user = await User.findOne({
      where: {
        provider: "google",
        provider_id: profile.id,
      },
    });

    if (!user) {
      user = await User.create({
        first_name: profile.name?.givenName || "",
        last_name: profile.name?.familyName || "",
        email: profile.emails?.[0]?.value || "",
        status: UserStatus.Activo,
        company: CompanyType.Externa,
        role: UserRole.Estandar,
        provider: "google",
        provider_id: profile.id,
      });
    }

    return user;
  }

  static async findOneByRole(role: UserRole) {
    return User.findOne({ where: { role } });
  }

  static async createAdminFromGoogleProfile(profile: any) {
    const existing = await this.findOneByRole(UserRole.Administrador);
    if (existing) {
      throw new Error("Ya existe un usuario admin.");
    }

    const adminUser = await User.create({
      first_name: profile.name?.givenName || "",
      last_name: profile.name?.familyName || "",
      email: profile.emails?.[0]?.value || "",
      status: UserStatus.Activo,
      company: CompanyType.Externa,
      role: UserRole.Administrador,
      provider: "google",
      provider_id: profile.id,
    });

    return adminUser;
  }

  static async completeUserProfile(userId: string, profileData: any) {
    try {
      const user = await UserService.findById(userId);
      if (!user) {
        throw new UnauthorizedError("Usuario no encontrado");
      }

      if (profileData.phone_number !== undefined) {
        const existingphone = await User.findOne({
          where: { phone_number: profileData.phone_number },
        });
        if (existingphone && existingphone.user_id !== userId) {
          throw new UnauthorizedError("Número de teléfono ya en uso");
        }
        user.phone_number = profileData.phone_number;
      }

      if (profileData.password !== undefined) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
          profileData.password,
          saltRounds
        );
        user.password = hashedPassword;
      }

      if (profileData.department_id !== undefined) {
        const department = await Department.findByPk(profileData.department_id);
        if (!department) {
          throw new NotFoundError("Departamento no encontrado");
        }
        user.department_id = profileData.department_id;
      }

      if (profileData.company !== undefined) {
        user.company = profileData.company;
      }

      await user.save();

      const { password, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      console.error("Error inesperado en completeUserProfile:", error);
      throw new InternalServerError("Error al completar el perfil");
    }
  }
}
