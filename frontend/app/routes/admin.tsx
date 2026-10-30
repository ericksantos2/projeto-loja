import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Layers,
  BarChart3,
  AlertTriangle,
  Loader2,
  LogIn,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import {
  getProducts, deleteProduct,
  getProductById,
  getCategories, createCategory, updateCategory, deleteCategory,
  reorderCategories, reorderFeaturedProducts,
} from "../services/products";
import type { Produto, Categoria, CategoriaPayload } from "../services/products";
import {
  getUsers,
  createUser,
  updateUser,
  resetUserPassword,
  updateUserStatus,
  deleteUser,
  type UsuarioAdmin,
  type CargoUsuario,
  type CriarUsuarioPayload,
  type AtualizarUsuarioPayload,
} from "../services/users";
import { fetchCurrentUser, isAdminOrGestor, isAuthenticated, onAuthChanged } from "~/services/auth";
import { useCart } from "~/components/CartContext";

import DashboardTab from "../components/admin/DashboardTab";
import ProductsTab from "../components/admin/ProductsTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import UsersTab from "../components/admin/UsersTab";
import ProductModal from "../components/admin/ProductModal";
import type { TaskResult } from "../components/admin/ProductModal";
import CategoryModal from "../components/admin/CategoryModal";

type AccessState = "checking" | "anonymous" | "forbidden" | "authorized";
type AdminTab = "dashboard" | "produtos" | "categorias" | "usuarios";

function mensagemErro(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function AdminPage() {
  const { openLogin } = useCart();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [access, setAccess] = useState<AccessState>("checking");
  const [role, setRole] = useState<CargoUsuario | "">("");
  const [currentUsername, setCurrentUsername] = useState("");

  const [products, setProducts] = useState<Produto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [users, setUsers] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modais de Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string; details: string[] } | null>(null);

  // Modais de Categoria
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);

  const invalidarConsultasPublicas = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["produtos"] });
    void queryClient.invalidateQueries({ queryKey: ["categorias"] });
  }, [queryClient]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodsData, catsData, usersData] = await Promise.all([
        getProducts(),
        getCategories(),
        getUsers(),
      ]);
      setProducts(prodsData || []);
      setCategories(catsData || []);
      setUsers(usersData || []);
      setError(null);
    } catch (err) {
      setError(mensagemErro(err, "Falha ao carregar dados do painel."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      if (!isAuthenticated()) {
        if (active) setAccess("anonymous");
        return;
      }

      try {
        const usuario = await fetchCurrentUser();
        if (!active) return;
        setRole(usuario.cargo);
        setCurrentUsername(usuario.username);
        if (isAdminOrGestor(usuario.cargo)) {
          setAccess("authorized");
          if (usuario.cargo === "GESTOR") {
            setActiveTab((prev) =>
              prev === "produtos" || prev === "categorias" ? "usuarios" : prev,
            );
          }
        } else {
          setAccess("forbidden");
        }
      } catch {
        if (active) setAccess("anonymous");
      }
    };

    void checkAccess();
    const unsubscribe = onAuthChanged(() => {
      void checkAccess();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (access !== "authorized") return;
    void fetchData();
  }, [access, fetchData]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 7000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  // --- Handlers para Produto ---
  const handleProductFinished = async (result: TaskResult) => {
    await fetchData();
    invalidarConsultasPublicas();

    if (result.failures.length === 0) {
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setToast({ type: "success", message: "Produto salvo com sucesso.", details: [] });
      return;
    }

    setToast({
      type: "error",
      message: `${result.failures.length} tarefa(s) falharam. ${result.ok} concluída(s).`,
      details: result.failures.map((falha) => `${falha.label}: ${falha.message}`),
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        invalidarConsultasPublicas();
      } catch (err) {
        alert(mensagemErro(err, "Erro ao excluir produto."));
      }
    }
  };

  const handleReorderFeatured = async (ids: string[]) => {
    try {
      await reorderFeaturedProducts(ids);
      setProducts((prev) =>
        prev.map((p) => {
          const idx = ids.indexOf(p.id);
          return idx >= 0 ? { ...p, posicaoDestaque: idx } : p;
        }),
      );
      invalidarConsultasPublicas();
    } catch (err) {
      const prodsData = await getProducts();
      setProducts(prodsData || []);
      alert(mensagemErro(err, "Erro ao salvar a ordem dos destaques."));
    }
  };

  const openProductModal = async (product?: Produto) => {
    if (!product) {
      setEditingProduct(null);
      setIsProductModalOpen(true);
      return;
    }

    try {
      // A listagem traz só o resumo; busca o detalhe para editar descrição/imagens.
      const detalhado = await getProductById(product.id);
      setEditingProduct({
        ...product,
        ...(detalhado ?? {}),
        categoryId: detalhado?.categoryId ?? product.categoryId,
      });
    } catch {
      setEditingProduct(product);
    }
    setIsProductModalOpen(true);
  };

  // --- Handlers para Categoria ---
  const handleSaveCategory = async (
    data: CategoriaPayload,
    foto?: File | null,
    id?: string,
  ) => {
    try {
      if (id !== undefined) {
        const atualizada = await updateCategory(
          id,
          { nome: data.nome, descricao: data.descricao },
          foto,
        );
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? atualizada : c)),
        );
      } else {
        const criada = await createCategory(data, foto);
        setCategories((prev) => [...prev, criada]);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      invalidarConsultasPublicas();
      setToast({
        type: "success",
        message: id ? "Categoria atualizada com sucesso." : "Categoria criada com sucesso.",
        details: [],
      });
    } catch (err) {
      setToast({
        type: "error",
        message: mensagemErro(err, "Erro ao salvar categoria."),
        details: [],
      });
    }
  };

  const handleReorderCategories = async (ids: string[]) => {
    try {
      await reorderCategories(ids);
      setCategories((prev) =>
        prev.map((c) => {
          const idx = ids.indexOf(c.id);
          return idx >= 0 ? { ...c, posicao: idx } : c;
        }),
      );
      invalidarConsultasPublicas();
    } catch (err) {
      const catsData = await getCategories();
      setCategories(catsData || []);
      alert(mensagemErro(err, "Erro ao salvar a ordem das categorias."));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        invalidarConsultasPublicas();
      } catch (err) {
        alert(mensagemErro(err, "Erro ao excluir categoria."));
      }
    }
  };

  const openCategoryModal = (category?: Categoria) => {
    setEditingCategory(category || null);
    setIsCategoryModalOpen(true);
  };

  // --- Handlers para Usuários ---
  const handleCreateUser = async (data: CriarUsuarioPayload) => {
    const novo = await createUser(data);
    setUsers((prev) =>
      [...prev, novo].sort((a, b) => a.username.localeCompare(b.username, "pt-BR")),
    );
    setToast({
      type: "success",
      message: `Usuário "${novo.username}" criado com sucesso.`,
      details: [],
    });
  };

  const handleUpdateUser = async (id: number, data: AtualizarUsuarioPayload) => {
    const atualizado = await updateUser(id, data);
    setUsers((prev) =>
      prev
        .map((u) => (u.id === id ? atualizado : u))
        .sort((a, b) => a.username.localeCompare(b.username, "pt-BR")),
    );
    setToast({
      type: "success",
      message: `Usuário "${atualizado.username}" atualizado com sucesso.`,
      details: [],
    });
  };

  const handleResetUserPassword = async (id: number, novaSenha: string) => {
    await resetUserPassword(id, novaSenha);
    setToast({
      type: "success",
      message: "Senha redefinida com sucesso.",
      details: [],
    });
  };

  const handleToggleUserStatus = async (user: UsuarioAdmin) => {
    try {
      const novoStatus = !user.ativo;
      await updateUserStatus(user.id, novoStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ativo: novoStatus } : u)),
      );
      setToast({
        type: "success",
        message: novoStatus
          ? `Conta de "${user.username}" reativada.`
          : `Conta de "${user.username}" desativada.`,
        details: [],
      });
    } catch (err) {
      setToast({
        type: "error",
        message: mensagemErro(err, "Erro ao alterar status do usuário."),
        details: [],
      });
    }
  };

  const handleDeleteUser = async (user: UsuarioAdmin) => {
    await deleteUser(user.id);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setToast({
      type: "success",
      message: `Usuário "${user.username}" excluído permanentemente.`,
      details: [],
    });
  };

  if (access === "checking") {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50/50 text-gray-400">
        <div className="flex flex-col items-center">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-black" />
          <p className="font-medium">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (access === "anonymous") {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50/50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Acesso restrito</h1>
          <p className="mt-2 text-sm text-gray-500">
            Entre com uma conta de administrador ou gestor para abrir o painel.
          </p>
          <button
            type="button"
            onClick={openLogin}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </button>
        </div>
      </div>
    );
  }

  if (access === "forbidden") {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50/50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Sem permissão</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sua conta ({role || "acesso atual"}) não tem permissão de administrador ou gestor
            para acessar o painel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Administração</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            {role === "ADMIN"
              ? "Gerencie seu catálogo, estoque, categorias e usuários."
              : "Gerencie os usuários do sistema."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Navegação Lateral / Topo */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-col gap-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center justify-center lg:justify-start gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "dashboard" 
                    ? "bg-black text-white shadow-md" 
                    : "bg-white lg:bg-transparent border border-gray-200 lg:border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>Visão Geral</span>
              </button>

              {role === "ADMIN" && (
                <>
                  <button
                    onClick={() => setActiveTab("produtos")}
                    className={`flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === "produtos" 
                        ? "bg-black text-white shadow-md" 
                        : "bg-white lg:bg-transparent border border-gray-200 lg:border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <span>Produtos</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'produtos' ? 'bg-white/20' : 'bg-gray-200'}`}>
                      {products.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("categorias")}
                    className={`flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === "categorias" 
                        ? "bg-black text-white shadow-md" 
                        : "bg-white lg:bg-transparent border border-gray-200 lg:border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <span>Categorias</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'categorias' ? 'bg-white/20' : 'bg-gray-200'}`}>
                      {categories.length}
                    </span>
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab("usuarios")}
                className={`flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "usuarios" 
                    ? "bg-black text-white shadow-md" 
                    : "bg-white lg:bg-transparent border border-gray-200 lg:border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>Usuários</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'usuarios' ? 'bg-white/20' : 'bg-gray-200'}`}>
                  {users.length}
                </span>
              </button>
            </nav>
          </aside>

          {/* Área de Conteúdo */}
          <main className="min-w-0 flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[420px] sm:min-h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[360px] sm:min-h-[400px] text-gray-400 p-4">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-black" />
                <p className="font-medium text-sm sm:text-base">Carregando dados do painel...</p>
              </div>
            ) : error ? (
              <div className="m-4 sm:m-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm sm:text-base">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            ) : (
              <div className="p-4 sm:p-6 lg:p-8">
                {activeTab === "dashboard" && (
                  <DashboardTab products={products} categories={categories} users={users} />
                )}

                {activeTab === "produtos" && role === "ADMIN" && (
                  <ProductsTab 
                    products={products} 
                    onAdd={() => openProductModal()} 
                    onEdit={openProductModal} 
                    onDelete={handleDeleteProduct} 
                    onReorderFeatured={handleReorderFeatured}
                  />
                )}

                {activeTab === "categorias" && role === "ADMIN" && (
                  <CategoriesTab 
                    categories={categories} 
                    onAdd={() => openCategoryModal()} 
                    onEdit={openCategoryModal} 
                    onDelete={handleDeleteCategory} 
                    onReorder={handleReorderCategories}
                  />
                )}

                {activeTab === "usuarios" && (role === "ADMIN" || role === "GESTOR") && (
                  <UsersTab
                    users={users}
                    currentUsername={currentUsername}
                    currentRole={role}
                    onCreateUser={handleCreateUser}
                    onUpdateUser={handleUpdateUser}
                    onResetPassword={handleResetUserPassword}
                    onToggleStatus={handleToggleUserStatus}
                    onDeleteUser={handleDeleteUser}
                  />
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modais */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onFinished={handleProductFinished}
        initialData={editingProduct}
        categories={categories}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-[70] w-[min(26rem,calc(100vw-2rem))] rounded-xl px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded p-1 hover:bg-white/20"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {toast.details.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-white/90">
              {toast.details.slice(0, 5).map((detail) => (
                <li key={detail}>• {detail}</li>
              ))}
              {toast.details.length > 5 && (
                <li>• e mais {toast.details.length - 5} falha(s)...</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
