import { useState } from "react";
import { Link } from "react-router-dom";
import SocialButton from "../../../components/ui/SocialButton";
import InputField from "../../../components/ui/InputField";
import Divider from "../../../components/ui/Divider";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { email, password });
    // Aquí harías la autenticación
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-sm w-full">
        <h1 className="text-xl font-semibold mb-4 text-center">Iniciar Sesión</h1>
        <p className="text-center text-sm mb-4 text-gray-600">
          Elige tu método de acceso preferido
        </p>
        <div className="flex flex-col gap-2">
          <SocialButton icon={<FaGoogle />} text="Continuar con Google" />
          <SocialButton icon={<FaGithub />} text="Continuar con GitHub" />
        </div>
        <Divider />
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Iniciar Sesión
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <a href="#" className="text-blue-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}