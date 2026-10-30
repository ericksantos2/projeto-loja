import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export interface ItemCarrinho {
  produtoId: string;
  nome: string;
  imagemPrincipal: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
}

export interface Carrinho {
  itens: ItemCarrinho[];
  total: number;
}

export const carrinhoQueryKey = ["carrinho"] as const;

export const getCarrinho = () => api.get<Carrinho>("/carrinho", { requiresAuth: true });

export const useCarrinhoQuery = (enabled = true) =>
  useQuery<Carrinho, Error>({
    queryKey: carrinhoQueryKey,
    queryFn: getCarrinho,
    enabled,
  });

export const useAdicionarAoCarrinho = () => {
  const queryClient = useQueryClient();

  return useMutation<Carrinho, Error, { produtoId: string; quantidade: number }>({
    mutationFn: ({ produtoId, quantidade }) =>
      api.post<Carrinho>("/carrinho/itens", { produtoId, quantidade }, { requiresAuth: true }),
    onSuccess: (carrinho) => queryClient.setQueryData(carrinhoQueryKey, carrinho),
  });
};

export const useAtualizarQuantidadeCarrinho = () => {
  const queryClient = useQueryClient();

  return useMutation<Carrinho, Error, { produtoId: string; quantidade: number }>({
    mutationFn: ({ produtoId, quantidade }) =>
      api.put<Carrinho>(`/carrinho/itens/${produtoId}`, { quantidade }, { requiresAuth: true }),
    onSuccess: (carrinho) => queryClient.setQueryData(carrinhoQueryKey, carrinho),
  });
};

export const useLimparCarrinho = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => api.delete<void>("/carrinho/itens", { requiresAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: carrinhoQueryKey }),
  });
};

export const useRemoverItemDoCarrinho = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (produtoId) =>
      api.delete<void>(`/carrinho/itens/${produtoId}`, { requiresAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: carrinhoQueryKey }),
  });
};
