import { CompanyType } from "../enums/companyType.enum";
import { UserRole } from "../enums/userRole.enum";
import { UserStatus } from "../enums/userStatus.enum";
import User from "../models/user.model";
import Department from "../models/department.model";

interface GoogleProfile {
  id: string;
  emails?: { value: string }[];
  name?: { givenName: string; familyName: string };
}

export class UserService {
  // Busca un usuario por su ID, lanza error si no existe
  static async findById(id: string) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error(`Usuario con id ${id} no encontrado.`);
    }
    return user;
  }

  // Busca o crea un usuario a partir del perfil Google
  static async findOrCreateGoogleUser(profile: GoogleProfile) {
    // Obtiene departamento por defecto para asignar (id=1)
    const department = await Department.findByPk(1);
    if (!department) {
      throw new Error("El departamento con id 1 no existe.");
    }

    // Busca usuario con provider google y provider_id igual al perfil
    let user = await User.findOne({
      where: {
        provider: "google",
        provider_id: profile.id,
      },
    });

    // Si no existe, crea un usuario nuevo con info del perfil
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

  // Busca un usuario por su rol (ej: Administrador)
  static async findOneByRole(role: UserRole) {
    return User.findOne({ where: { role } });
  }

  // Crea un usuario administrador a partir del perfil Google, solo si no existe otro admin
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
      provider_id: profile.id
    });

    return adminUser;
  }
}
