import { Package, Layers, AlertTriangle, Users } from "lucide-react";
import type { Produto, Categoria } from "../../services/products";
import type { UsuarioAdmin } from "../../services/users";

interface DashboardTabProps {
  products: Produto[];
  categories: Categoria[];
  users?: UsuarioAdmin[];
}

export default function DashboardTab({ products, categories, users = [] }: DashboardTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6 flex-1">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Resumo do Sistema</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">Total de Produtos</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{products.length}</h3>
          </div>
          <div className="p-3 sm:p-4 bg-white shadow-sm text-black rounded-xl shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">Categorias Ativas</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{categories.length}</h3>
          </div>
          <div className="p-3 sm:p-4 bg-white shadow-sm text-black rounded-xl shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">Total de Usuários</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{users.length}</h3>
          </div>
          <div className="p-3 sm:p-4 bg-white shadow-sm text-black rounded-xl shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-amber-50 p-4 sm:p-5 rounded-2xl border border-amber-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-amber-700 mb-1 truncate">Estoque Baixo (&lt; 5)</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-amber-600">
              {products.filter(p => (p.estoque ?? 0) < 5).length}
            </h3>
          </div>
          <div className="p-3 sm:p-4 bg-white shadow-sm text-amber-500 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
