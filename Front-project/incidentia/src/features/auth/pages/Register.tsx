import { useState } from "react";
import { Link } from "react-router-dom";
import SocialButton from "../../../components/ui/SocialButton";
import InputField from "../../../components/ui/InputField";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      phone_number: phone || null,
    };

    console.log("Datos del formulario:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">
        <h1 className="text-xl font-semibold mb-4 text-center">Crear Cuenta</h1>
        <p className="text-center text-sm mb-4 text-gray-600">
          Completa tus datos para registrarte en la plataforma
        </p>

        {/* Botones sociales */}
        <div className="flex flex-col gap-2">
          <SocialButton
            icon={<FaGoogle />}
            text="Registrarse con Google"
            href={`${import.meta.env.VITE_API_URL}/auth/google`} 
          />

          <SocialButton icon={<FaGithub />} text="Registrarse con GitHub" />
        </div>

        {/* Divider personalizado */}
        <div className="flex items-center gap-2 my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="text-sm text-gray-500">O REGÍSTRATE CON EMAIL</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Información Personal */}
          <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              📋 Información Personal
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <InputField
                label="Nombre *"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <InputField
                label="Apellido *"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <InputField
                label="Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputField
                label="Teléfono"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <InputField
              label="Contraseña *"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Crear Cuenta
          </button>
        </form>

        <div className="flex justify-center mt-4 text-sm">
          <span className="text-gray-600">¿Ya tienes cuenta? </span>
          <Link to="/login" className="text-blue-600 hover:underline ml-1">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
