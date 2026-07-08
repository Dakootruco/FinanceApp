import { query } from '../config/db.js';

/**
 * Obtener datos agregados para reportes avanzados.
 */
export const getReportData = async (req, res, next) => {
  const { startDate, endDate, bank_account_id } = req.query;

  // Fechas por defecto (Mes actual: desde el primer día hasta hoy o el último día)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-12
  
  const defaultStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const defaultEndDate = today.toISOString().split('T')[0];

  const filterStart = startDate || defaultStartDate;
  const filterEnd = endDate || defaultEndDate;

  try {
    // 1. Construir filtros base para los queries
    let filterSql = 'WHERE t.date >= $1 AND t.date <= $2 AND t.user_id = $3';
    const params = [filterStart, filterEnd, req.user.id];

    if (bank_account_id && bank_account_id !== 'all') {
      params.push(parseInt(bank_account_id, 10));
      filterSql += ` AND t.bank_account_id = $${params.length}`;
    }

    // 2. Query de Resumen (Ingresos, Gastos)
    const summarySql = `
      SELECT 
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses
      FROM transactions t
      ${filterSql}
    `;
    const summaryResult = await query(summarySql, params);
    
    const totalIncome = parseFloat(summaryResult.rows[0].total_income || 0);
    const totalExpenses = parseFloat(summaryResult.rows[0].total_expenses || 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // Calcular días para el promedio de gasto diario
    const date1 = new Date(filterStart);
    const date2 = new Date(filterEnd);
    const diffTime = Math.abs(date2 - date1);
    const totalDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 1);
    const avgDailySpend = totalExpenses / totalDays;

    // 3. Query de Categoría con Mayor Gasto
    const topCategorySql = `
      SELECT c.name, SUM(t.amount) as total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${filterSql} AND t.type = 'expense'
      GROUP BY c.name
      ORDER BY total DESC
      LIMIT 1
    `;
    const topCategoryResult = await query(topCategorySql, params);
    const topCategory = topCategoryResult.rows.length > 0 
      ? { name: topCategoryResult.rows[0].name, amount: parseFloat(topCategoryResult.rows[0].total) }
      : { name: 'Ninguna', amount: 0 };

    // 4. Query de Distribución de Gastos por Categoría
    const categoriesSql = `
      SELECT 
        t.category_id as id,
        COALESCE(c.name, 'Otros Gastos') as name,
        COALESCE(c.color, '#6B7280') as color,
        COALESCE(c.icon, 'minus-circle') as icon,
        SUM(t.amount) as total,
        COUNT(t.id) as count,
        b.limit_amount
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN budgets b ON b.category_id = c.id AND b.user_id = $3
      ${filterSql} AND t.type = 'expense'
      GROUP BY t.category_id, c.name, c.color, c.icon, b.limit_amount
      ORDER BY total DESC
    `;
    const categoriesResult = await query(categoriesSql, params);
    const categoriesData = categoriesResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      total: parseFloat(row.total || 0),
      count: parseInt(row.count || 0, 10),
      limit_amount: row.limit_amount ? parseFloat(row.limit_amount) : null
    }));

    // 5. Query de Historial Mensual Comparativo (Agrupado por Mes)
    const monthlySql = `
      SELECT 
        TO_CHAR(t.date, 'YYYY-MM') as month_str,
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as income,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as expense
      FROM transactions t
      ${filterSql}
      GROUP BY TO_CHAR(t.date, 'YYYY-MM')
      ORDER BY month_str ASC
    `;
    const monthlyResult = await query(monthlySql, params);
    const monthlyData = monthlyResult.rows.map(row => ({
      month: row.month_str,
      income: parseFloat(row.income || 0),
      expense: parseFloat(row.expense || 0)
    }));

    // 6. Query de Métodos de Pago (Efectivo vs Bancos vs Sin Cuenta)
    const paymentMethodsSql = `
      SELECT 
        COALESCE(ba.name, 'Sin Cuenta') as name,
        SUM(t.amount) as total
      FROM transactions t
      LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
      ${filterSql} AND t.type = 'expense'
      GROUP BY ba.name
      ORDER BY total DESC
    `;
    const paymentMethodsResult = await query(paymentMethodsSql, params);
    const paymentMethodsData = paymentMethodsResult.rows.map(row => ({
      name: row.name,
      total: parseFloat(row.total || 0)
    }));

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        savings,
        savingsRate,
        avgDailySpend,
        topCategory
      },
      categories: categoriesData,
      monthly: monthlyData,
      paymentMethods: paymentMethodsData
    });
  } catch (error) {
    next(error);
  }
};
