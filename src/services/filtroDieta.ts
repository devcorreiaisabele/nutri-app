export type ReceitaFiltravel = {
  tags?: string | string[] | null;
  ingredientes?: string | null;
};

type Dieta = 'onivora' | 'vegana' | 'vegetariana' | 'pescetariana';

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function listaDeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
    return tags.split(',');
  }
  return [];
}

function contemPalavra(texto: string, termo: string) {
  const re = new RegExp(`(^|[^a-z])${termo}s?([^a-z]|$)`);
  return re.test(texto);
}

const TAGS_COMPATIVEIS: Record<Dieta, string[]> = {
  onivora:      [],
  vegana:       ['vegana', 'vegano', 'vegan'],
  vegetariana:  ['vegana', 'vegano', 'vegan', 'vegetariana', 'vegetariano'],
  pescetariana: ['vegana', 'vegano', 'vegan', 'vegetariana', 'vegetariano', 'pescetariana', 'pescetariano'],
};

const TAGS_DE_OUTRAS_DIETAS = ['onivora', 'onivoro', 'carnivora', 'carnivoro'];

const CARNES = [
  'carne', 'frango', 'porco', 'bacon', 'presunto', 'linguica', 'salsicha', 'bife',
  'peru', 'costela', 'calabresa', 'carne seca', 'charque', 'peito de frango',
  'file mignon', 'bovina', 'suina',
];

const PEIXES = [
  'peixe', 'atum', 'salmao', 'camarao', 'sardinha', 'bacalhau', 'tilapia', 'lula',
  'polvo', 'marisco', 'frutos do mar', 'caranguejo', 'siri', 'lagosta',
];

const ANIMAIS_OUTROS = [
  'ovo', 'leite', 'queijo', 'manteiga', 'iogurte', 'requeijao', 'creme de leite',
  'mel', 'gelatina', 'nata', 'whey', 'mussarela', 'parmesao', 'ricota', 'cream cheese',
];

const PROIBIDOS: Record<Dieta, string[]> = {
  onivora:      [],
  vegana:       [...CARNES, ...PEIXES, ...ANIMAIS_OUTROS],
  vegetariana:  [...CARNES, ...PEIXES],
  pescetariana: [...CARNES],
};

const EXCECOES = [
  'leite de coco', 'leite vegetal', 'leite de amendoas', 'leite de aveia',
  'leite de soja', 'leite de arroz', 'leite de castanha',
  'manteiga de amendoim', 'manteiga de cacau', 'manteiga de amendoas',
  'queijo vegano', 'queijo vegetal', 'iogurte vegetal', 'iogurte de coco',
  'creme de leite vegetal', 'creme de coco',
];

function removerExcecoes(texto: string) {
  return EXCECOES.reduce((acc, ex) => acc.split(ex).join(' '), texto);
}

function dietaValida(valor: string | null | undefined): Dieta | null {
  const n = normalizar(valor ?? '');
  if (n === 'onivora' || n === 'vegana' || n === 'vegetariana' || n === 'pescetariana') return n;
  return null;
}

export function receitaCompativel(
  receita: ReceitaFiltravel,
  dietaUsuario: string | null | undefined,
): boolean {
  const dieta = dietaValida(dietaUsuario);
  if (!dieta || dieta === 'onivora') return true;

  const tags = listaDeTags(receita.tags).map(normalizar).filter(Boolean);
  const ingredientes = removerExcecoes(normalizar(String(receita.ingredientes ?? '')));

  if (tags.some(t => TAGS_COMPATIVEIS[dieta].includes(t))) return true;
  if (tags.some(t => TAGS_DE_OUTRAS_DIETAS.includes(t))) return false;
  if (!ingredientes) return false;

  return !PROIBIDOS[dieta].some(p => contemPalavra(ingredientes, p));
}

export function filtrarPorDieta<T extends ReceitaFiltravel>(
  receitas: T[],
  dieta: string | null | undefined,
): T[] {
  return receitas.filter(r => receitaCompativel(r, dieta));
}