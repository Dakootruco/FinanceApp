import { useFinanceStore } from '../../../store/useFinanceStore.js';
import { Select, Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';

export const TransactionFilters = () => {
  const { filters, setFilters, resetFilters, categories } = useFinanceStore();

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  return (
    <div className="flex gap-4 flex-wrap bg-slate-50 p-4 border border-slate-100/80 rounded-2xl items-center mb-6">
      
      {/* Filtro Tipo */}
      <div className="flex-1 min-w-[150px]">
        <Select
          aria-label="Filtrar por tipo"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="!py-2.5 !bg-white border-slate-200/50"
        >
          <option value="">Todos los tipos</option>
          <option value="expense">Gastos</option>
          <option value="income">Ingresos</option>
        </Select>
      </div>

      {/* Filtro Categoría */}
      <div className="flex-1 min-w-[150px]">
        <Select
          aria-label="Filtrar por categoría"
          value={filters.category_id}
          onChange={(e) => handleFilterChange('category_id', e.target.value)}
          className="!py-2.5 !bg-white border-slate-200/50"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type === 'income' ? 'Ingreso' : 'Gasto'})
            </option>
          ))}
        </Select>
      </div>

      {/* Fecha Inicio */}
      <div className="flex-1 min-w-[150px]">
        <Input
          aria-label="Fecha inicio"
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="!py-2.5 !bg-white border-slate-200/50"
        />
      </div>

      {/* Fecha Fin */}
      <div className="flex-1 min-w-[150px]">
        <Input
          aria-label="Fecha fin"
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="!py-2.5 !bg-white border-slate-200/50"
        />
      </div>

      {/* Limpiar Filtros */}
      {hasActiveFilters && (
        <Button 
          variant="secondary"
          onClick={resetFilters}
          className="!py-2.5 !px-4"
        >
          Limpiar Filtros
        </Button>
      )}

    </div>
  );
};
