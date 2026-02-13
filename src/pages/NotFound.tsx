import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-gray-800 dark:text-gray-200">
          404
        </h1>
        <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
          Página não encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Início
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Ir para Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}