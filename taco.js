/**
 * Tabela Brasileira de Composição de Alimentos (TACO - Unicamp)
 * Valores nutricionais por 100g de alimento
 */

const TACO_DATABASE = [
  // CEREAIS, TUBÉRCULOS E DERIVADOS
  { id: 'taco-1', name: 'Arroz branco cozido', category: 'Cereais', kcal: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6 },
  { id: 'taco-2', name: 'Arroz integral cozido', category: 'Cereais', kcal: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7 },
  { id: 'taco-3', name: 'Aveia em flocos crua', category: 'Cereais', kcal: 394, protein: 13.9, carbs: 66.6, fat: 8.5, fiber: 9.1 },
  { id: 'taco-4', name: 'Batata inglesa cozida', category: 'Tubérculos', kcal: 52, protein: 1.2, carbs: 11.9, fat: 0.1, fiber: 1.3 },
  { id: 'taco-5', name: 'Batata inglesa assada/airfryer', category: 'Tubérculos', kcal: 85, protein: 2.1, carbs: 19.5, fat: 0.2, fiber: 1.8 },
  { id: 'taco-6', name: 'Batata doce cozida', category: 'Tubérculos', kcal: 77, protein: 0.6, carbs: 18.4, fat: 0.1, fiber: 2.2 },
  { id: 'taco-7', name: 'Mandioca / Aipim cozido', category: 'Tubérculos', kcal: 125, protein: 0.6, carbs: 30.1, fat: 0.3, fiber: 1.6 },
  { id: 'taco-8', name: 'Macarrão cozido (sem molho)', category: 'Cereais', kcal: 102, protein: 3.5, carbs: 21.0, fat: 0.4, fiber: 1.1 },
  { id: 'taco-9', name: 'Macarrão integral cozido', category: 'Cereais', kcal: 124, protein: 5.3, carbs: 26.5, fat: 0.5, fiber: 3.9 },
  { id: 'taco-10', name: 'Pão francês', category: 'Pães', kcal: 300, protein: 8.0, carbs: 58.7, fat: 3.1, fiber: 2.3 },
  { id: 'taco-11', name: 'Pão de forma integral', category: 'Pães', kcal: 253, protein: 9.4, carbs: 49.9, fat: 3.7, fiber: 6.9 },
  { id: 'taco-12', name: 'Tapioca (goma hidratada)', category: 'Cereais', kcal: 242, protein: 0.1, carbs: 60.0, fat: 0.0, fiber: 0.5 },
  { id: 'taco-13', name: 'Cuscuz de milho cozido', category: 'Cereais', kcal: 113, protein: 2.2, carbs: 25.3, fat: 0.7, fiber: 1.8 },
  { id: 'taco-14', name: 'Milho verde cozido', category: 'Cereais', kcal: 98, protein: 3.2, carbs: 17.1, fat: 2.4, fiber: 4.6 },

  // CARNES, AVES, PEIXES E OVOS
  { id: 'taco-15', name: 'Peito de frango grelhado', category: 'Aves', kcal: 159, protein: 32.0, carbs: 0.0, fat: 2.5, fiber: 0.0 },
  { id: 'taco-16', name: 'Peito de frango cozido / desfiado', category: 'Aves', kcal: 163, protein: 31.5, carbs: 0.0, fat: 3.2, fiber: 0.0 },
  { id: 'taco-17', name: 'Sobrecoxa de frango sem pele grelhada', category: 'Aves', kcal: 233, protein: 28.5, carbs: 0.0, fat: 12.3, fiber: 0.0 },
  { id: 'taco-18', name: 'Carne bovina Patinho cozido/moído', category: 'Carnes', kcal: 219, protein: 35.9, carbs: 0.0, fat: 7.3, fiber: 0.0 },
  { id: 'taco-19', name: 'Carne bovina Alcatra grelhada', category: 'Carnes', kcal: 241, protein: 31.9, carbs: 0.0, fat: 11.6, fiber: 0.0 },
  { id: 'taco-20', name: 'Carne bovina Filé mignon grelhado', category: 'Carnes', kcal: 220, protein: 32.8, carbs: 0.0, fat: 8.8, fiber: 0.0 },
  { id: 'taco-21', name: 'Carne bovina Maminha grelhada', category: 'Carnes', kcal: 250, protein: 30.5, carbs: 0.0, fat: 13.5, fiber: 0.0 },
  { id: 'taco-22', name: 'Tilápia filé grelhado', category: 'Peixes', kcal: 128, protein: 26.2, carbs: 0.0, fat: 2.7, fiber: 0.0 },
  { id: 'taco-23', name: 'Salmão filé grelhado', category: 'Peixes', kcal: 229, protein: 24.0, carbs: 0.0, fat: 14.2, fiber: 0.0 },
  { id: 'taco-24', name: 'Atum conservado em água (drenado)', category: 'Peixes', kcal: 116, protein: 25.5, carbs: 0.0, fat: 0.8, fiber: 0.0 },
  { id: 'taco-25', name: 'Ovo de galinha inteiro cozido', category: 'Ovos', kcal: 146, protein: 13.3, carbs: 0.6, fat: 9.5, fiber: 0.0 },
  { id: 'taco-26', name: 'Clara de ovo cozida', category: 'Ovos', kcal: 52, protein: 11.2, carbs: 0.7, fat: 0.2, fiber: 0.0 },
  { id: 'taco-27', name: 'Lombo suíno assado', category: 'Carnes', kcal: 210, protein: 35.7, carbs: 0.0, fat: 6.4, fiber: 0.0 },

  // LEGUMINOSAS
  { id: 'taco-28', name: 'Feijão carioca cozido (50% caldo)', category: 'Leguminosas', kcal: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5 },
  { id: 'taco-29', name: 'Feijão preto cozido (50% caldo)', category: 'Leguminosas', kcal: 77, protein: 4.5, carbs: 14.0, fat: 0.5, fiber: 8.4 },
  { id: 'taco-30', name: 'Lentilha cozida', category: 'Leguminosas', kcal: 93, protein: 6.3, carbs: 16.3, fat: 0.5, fiber: 7.9 },
  { id: 'taco-31', name: 'Grão-de-bico cozido', category: 'Leguminosas', kcal: 140, protein: 8.4, carbs: 23.2, fat: 2.1, fiber: 5.4 },

  // LATICÍNIOS E SUPLEMENTOS
  { id: 'taco-32', name: 'Whey Protein Concentrado 80%', category: 'Suplementos', kcal: 400, protein: 80.0, carbs: 6.0, fat: 6.0, fiber: 0.0 },
  { id: 'taco-33', name: 'Whey Protein Isolado 90%', category: 'Suplementos', kcal: 370, protein: 90.0, carbs: 1.5, fat: 1.0, fiber: 0.0 },
  { id: 'taco-34', name: 'Creatina monohidratada (porção)', category: 'Suplementos', kcal: 0, protein: 0.0, carbs: 0.0, fat: 0.0, fiber: 0.0 },
  { id: 'taco-35', name: 'Leite de vaca desnatado', category: 'Laticínios', kcal: 35, protein: 3.4, carbs: 5.0, fat: 0.1, fiber: 0.0 },
  { id: 'taco-36', name: 'Leite de vaca semi-desnatado', category: 'Laticínios', kcal: 45, protein: 3.2, carbs: 4.9, fat: 1.5, fiber: 0.0 },
  { id: 'taco-37', name: 'Leite de vaca integral', category: 'Laticínios', kcal: 60, protein: 3.2, carbs: 4.7, fat: 3.2, fiber: 0.0 },
  { id: 'taco-38', name: 'Iogurte natural desnatado', category: 'Laticínios', kcal: 41, protein: 3.8, carbs: 5.8, fat: 0.3, fiber: 0.0 },
  { id: 'taco-39', name: 'Iogurte natural integral', category: 'Laticínios', kcal: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0.0 },
  { id: 'taco-40', name: 'Queijo Cottage', category: 'Laticínios', kcal: 98, protein: 11.5, carbs: 3.4, fat: 4.3, fiber: 0.0 },
  { id: 'taco-41', name: 'Queijo Minas frescal', category: 'Laticínios', kcal: 264, protein: 17.4, carbs: 3.2, fat: 20.2, fiber: 0.0 },
  { id: 'taco-42', name: 'Queijo Mussarela', category: 'Laticínios', kcal: 280, protein: 22.0, carbs: 2.0, fat: 21.0, fiber: 0.0 },
  { id: 'taco-43', name: 'Requeijão cremoso light', category: 'Laticínios', kcal: 180, protein: 10.0, carbs: 4.5, fat: 13.5, fiber: 0.0 },

  // FRUTAS
  { id: 'taco-44', name: 'Banana Prata', category: 'Frutas', kcal: 98, protein: 1.3, carbs: 26.0, fat: 0.1, fiber: 2.0 },
  { id: 'taco-45', name: 'Banana Nanica', category: 'Frutas', kcal: 92, protein: 1.4, carbs: 23.8, fat: 0.1, fiber: 1.9 },
  { id: 'taco-46', name: 'Maçã Fuji com casca', category: 'Frutas', kcal: 56, protein: 0.3, carbs: 15.2, fat: 0.0, fiber: 1.3 },
  { id: 'taco-47', name: 'Mamão Papaia', category: 'Frutas', kcal: 40, protein: 0.5, carbs: 10.4, fat: 0.1, fiber: 1.0 },
  { id: 'taco-48', name: 'Abacate', category: 'Frutas', kcal: 96, protein: 1.2, carbs: 6.0, fat: 8.4, fiber: 6.3 },
  { id: 'taco-49', name: 'Morango in natura', category: 'Frutas', kcal: 30, protein: 0.9, carbs: 6.8, fat: 0.3, fiber: 1.7 },
  { id: 'taco-50', name: 'Melancia', category: 'Frutas', kcal: 33, protein: 0.9, carbs: 8.1, fat: 0.0, fiber: 0.1 },
  { id: 'taco-51', name: 'Abacaxi pérola', category: 'Frutas', kcal: 48, protein: 0.9, carbs: 12.3, fat: 0.1, fiber: 1.0 },
  { id: 'taco-52', name: 'Laranja pera', category: 'Frutas', kcal: 46, protein: 1.0, carbs: 11.5, fat: 0.1, fiber: 1.8 },
  { id: 'taco-53', name: 'Uva Itália / Rubi', category: 'Frutas', kcal: 53, protein: 0.7, carbs: 13.6, fat: 0.2, fiber: 0.9 },

  // GORDURAS, ÓLEOS E OLEAGINOSAS
  { id: 'taco-54', name: 'Azeite de oliva extravirgem', category: 'Gorduras', kcal: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0 },
  { id: 'taco-55', name: 'Pasta de amendoim integral', category: 'Gorduras', kcal: 588, protein: 25.0, carbs: 20.0, fat: 50.0, fiber: 8.0 },
  { id: 'taco-56', name: 'Amendoim torrado sem sal', category: 'Oleaginosas', kcal: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },
  { id: 'taco-57', name: 'Castanha-de-caju torrada', category: 'Oleaginosas', kcal: 570, protein: 18.5, carbs: 29.1, fat: 46.3, fiber: 3.7 },
  { id: 'taco-58', name: 'Castanha-do-Brasil / Pará', category: 'Oleaginosas', kcal: 643, protein: 14.5, carbs: 15.1, fat: 63.5, fiber: 7.9 },
  { id: 'taco-59', name: 'Manteiga com/sem sal', category: 'Gorduras', kcal: 726, protein: 0.6, carbs: 0.0, fat: 82.4, fiber: 0.0 },

  // VERDURAS, HORTALIÇAS E LEGUMES
  { id: 'taco-60', name: 'Brócolis cozido', category: 'Hortaliças', kcal: 25, protein: 2.1, carbs: 4.4, fat: 0.5, fiber: 3.4 },
  { id: 'taco-61', name: 'Cenoura cozida', category: 'Hortaliças', kcal: 30, protein: 0.8, carbs: 6.7, fat: 0.2, fiber: 2.6 },
  { id: 'taco-62', name: 'Tomate com semente cru', category: 'Hortaliças', kcal: 15, protein: 1.1, carbs: 3.1, fat: 0.2, fiber: 1.2 },
  { id: 'taco-63', name: 'Alface americana / crespa', category: 'Hortaliças', kcal: 11, protein: 1.3, carbs: 1.7, fat: 0.2, fiber: 1.3 }
];

window.TACO_DATABASE = TACO_DATABASE;
