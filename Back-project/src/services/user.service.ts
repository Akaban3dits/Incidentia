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
import { GoogleProfile } from "../types/googleProfile.interface";
import { CreateUserDTO, UpdateUserProfileDTO } from "../types/user.interface";

/**
 * Servicio para manejar la lógica de negocios relacionada con usuarios.
 */
export class UserService {
  /**
   * Crea un usuario estándar con correo y contraseña.
   * @param data Información del usuario a crear
   * @returns El usuario creado
   * @throws UnauthorizedError si el correo ya está en uso
   */
  static async createUser(data: CreateUserDTO) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new UnauthorizedError("El correo electrónico ya está en uso.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: hashedPassword,
      company: CompanyType.Externa,
      role: UserRole.Estandar,
      status: UserStatus.Activo,
    });

    return user;
  }

  /**
   * Busca un usuario por su ID.
   * @param id ID del usuario
   * @returns Usuario encontrado
   * @throws NotFoundError si no existe el usuario
   */
  static async findById(id: string) {
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError(`Usuario con id ${id} no encontrado.`);
    return user;
  }

  /**
   * Busca o crea un usuario mediante su perfil de Google.
   * @param profile Perfil de Google
   * @returns Usuario existente o recién creado
   */
  static async findOrCreateGoogleUser(profile: GoogleProfile) {
    let user = await User.findOne({
      where: { provider: "google", provider_id: profile.id },
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

  /**
   * Busca un usuario por su rol específico.
   * @param role Rol del usuario
   * @returns Usuario con ese rol, si existe
   */
  static async findOneByRole(role: UserRole) {
    return User.findOne({ where: { role } });
  }

  /**
   * Crea un administrador usando perfil de Google.
   * Solo se permite un administrador.
   * @param profile Perfil de Google
   * @returns Usuario administrador creado
   * @throws Error si ya existe un administrador
   */
  static async createAdminFromGoogleProfile(profile: GoogleProfile) {
    const existing = await this.findOneByRole(UserRole.Administrador);
    if (existing) throw new Error("Ya existe un usuario admin.");

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

  /**
   * Completa o actualiza el perfil de un usuario.
   * @param userId ID del usuario
   * @param profileData Datos a actualizar
   * @returns Usuario actualizado sin la contraseña
   * @throws UnauthorizedError, NotFoundError, InternalServerError
   */
  static async completeUserProfile(userId: string, profileData: UpdateUserProfileDTO) {
    try {
      const user = await this.findById(userId);

      // Actualiza teléfono y valida unicidad
      if (profileData.phone_number !== undefined) {
        const existingPhone = await User.findOne({
          where: { phone_number: profileData.phone_number },
        });
        if (existingPhone && existingPhone.user_id !== userId) {
          throw new UnauthorizedError("Número de teléfono ya en uso");
        }
        user.phone_number = profileData.phone_number;
      }

      // Actualiza contraseña con hash
      if (profileData.password !== undefined) {
        user.password = await bcrypt.hash(profileData.password, 10);
      }

      // Actualiza departamento
      if (profileData.department_id !== undefined) {
        const department = await Department.findByPk(profileData.department_id);
        if (!department) throw new NotFoundError("Departamento no encontrado");
        user.department_id = profileData.department_id;
      }

      // Actualiza tipo de compañía
      if (profileData.company !== undefined) {
        user.company = profileData.company;
      }

      await user.save();

      // Retorna usuario sin la contraseña
      const { password, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof NotFoundError) throw error;
      console.error("Error inesperado en completeUserProfile:", error);
      throw new InternalServerError("Error al completar el perfil");
    }
  }
}
