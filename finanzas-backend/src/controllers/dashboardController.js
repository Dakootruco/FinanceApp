import { query } from '../config/db.js';

/**
 * Obtener datos consolidados para el dashboard (balances y datos para gráficos).
 */
export const getDashboardData = async (req, res, next) => {
  try {
    // 1. Resumen de totales (Ingresos, Gastos y Balance) - Excluyendo traspasos propios por categoría o descripción
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'income' 
          AND (c.name IS NULL OR (LOWER(c.name) NOT LIKE '%propia%' AND LOWER(c.name) NOT LIKE '%traspaso%' AND LOWER(c.name) NOT LIKE '%pago tarjeta%' AND LOWER(c.name) NOT LIKE '%tubancoap%'))
          AND (LOWER(t.description) NOT LIKE '%propia%' AND LOWER(t.description) NOT LIKE '%traspaso%' AND LOWER(t.description) NOT LIKE '%pago tarjeta%' AND LOWER(t.description) NOT LIKE '%tubancoap%')
          THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' 
          AND (c.name IS NULL OR (LOWER(c.name) NOT LIKE '%propia%' AND LOWER(c.name) NOT LIKE '%traspaso%' AND LOWER(c.name) NOT LIKE '%pago tarjeta%' AND LOWER(c.name) NOT LIKE '%tubancoap%'))
          AND (LOWER(t.description) NOT LIKE '%propia%' AND LOWER(t.description) NOT LIKE '%traspaso%' AND LOWER(t.description) NOT LIKE '%pago tarjeta%' AND LOWER(t.description) NOT LIKE '%tubancoap%')
          THEN t.amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN t.bank_account_id IS NULL AND t.type = 'income' THEN t.amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN t.bank_account_id IS NULL AND t.type = 'expense' THEN t.amount ELSE 0 END), 0) as cash_balance
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1;
    `;
    const summaryResult = await query(summaryQuery, [req.user.id]);
    const { total_income, total_expenses, cash_balance } = summaryResult.rows[0];
    const balance = parseFloat(total_income) - parseFloat(total_expenses);

    // 2. Gastos agrupados por categoría (Ideal para un Gráfico de Pastel / Donut) - Excluyendo traspasos propios
    const categoryExpensesQuery = `
      SELECT 
        t.category_id,
        COALESCE(c.name, 'Otros Gastos') as category_name,
        COALESCE(c.color, '#6B7280') as category_color,
        COALESCE(c.icon, 'minus-circle') as category_icon,
        COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'expense' AND t.user_id = $1
        AND (c.name IS NULL OR (LOWER(c.name) NOT LIKE '%propia%' AND LOWER(c.name) NOT LIKE '%traspaso%' AND LOWER(c.name) NOT LIKE '%pago tarjeta%' AND LOWER(c.name) NOT LIKE '%tubancoap%'))
        AND (LOWER(t.description) NOT LIKE '%propia%' AND LOWER(t.description) NOT LIKE '%traspaso%' AND LOWER(t.description) NOT LIKE '%pago tarjeta%' AND LOWER(t.description) NOT LIKE '%tubancoap%')
      GROUP BY t.category_id, c.name, c.color, c.icon
      ORDER BY total DESC;
    `;
    const categoryExpensesResult = await query(categoryExpensesQuery, [req.user.id]);

    // 3. Histórico mensual de los últimos 6 meses (Ideal para un Gráfico de Barras / Líneas) - Excluyendo traspasos propios
    const monthlyHistoryQuery = `
      SELECT 
        TO_CHAR(t.date, 'YYYY-MM') as month,
        COALESCE(SUM(CASE WHEN t.type = 'income' 
          AND (c.name IS NULL OR (LOWER(c.name) NOT LIKE '%propia%' AND LOWER(c.name) NOT LIKE '%traspaso%' AND LOWER(c.name) NOT LIKE '%pago tarjeta%' AND LOWER(c.name) NOT LIKE '%tubancoap%'))
          AND (LOWER(t.description) NOT LIKE '%propia%' AND LOWER(t.description) NOT LIKE '%traspaso%' AND LOWER(t.description) NOT LIKE '%pago tarjeta%' AND LOWER(t.description) NOT LIKE '%tubancoap%')
          THEN t.amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' 
          AND (c.name IS NULL OR (LOWER(c.name) NOT LIKE '%propia%' AND LOWER(c.name) NOT LIKE '%traspaso%' AND LOWER(c.name) NOT LIKE '%pago tarjeta%' AND LOWER(c.name) NOT LIKE '%tubancoap%'))
          AND (LOWER(t.description) NOT LIKE '%propia%' AND LOWER(t.description) NOT LIKE '%traspaso%' AND LOWER(t.description) NOT LIKE '%pago tarjeta%' AND LOWER(t.description) NOT LIKE '%tubancoap%')
          THEN t.amount ELSE 0 END), 0) as expense
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.date >= CURRENT_DATE - INTERVAL '6 months' AND t.user_id = $1
      GROUP BY TO_CHAR(t.date, 'YYYY-MM')
      ORDER BY month ASC;
    `;
    const monthlyHistoryResult = await query(monthlyHistoryQuery, [req.user.id]);

    res.json({
      summary: {
        totalIncome: parseFloat(total_income),
        totalExpenses: parseFloat(total_expenses),
        balance: balance,
        cashBalance: parseFloat(cash_balance || 0)
      },
      expensesByCategory: categoryExpensesResult.rows.map(row => ({
        ...row,
        total: parseFloat(row.total)
      })),
      monthlyHistory: monthlyHistoryResult.rows.map(row => ({
        month: row.month,
        income: parseFloat(row.income),
        expense: parseFloat(row.expense)
      }))
    });
  } catch (error) {
    next(error);
  }
};
