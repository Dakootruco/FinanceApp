import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { query } from '../config/db.js';

/**
 * Normaliza y limpia un string numérico para convertirlo a float de JS.
 * Maneja formatos con puntos de miles y comas decimales (ej: 1.250,50 o -4.500)
 * o formatos estándar con comas de miles y puntos decimales (ej: -1,250.50).
 */
const parseMoneyAmount = (amountStr) => {
  if (!amountStr) return 0;
  
  // Quitar el signo de moneda y espacios
  let clean = amountStr.replace(/[\$\s]/g, '');
  
  // Detectar si usa coma como decimal o punto como decimal
  // Si tiene puntos y comas, por ejemplo "1.250,50"
  if (clean.includes('.') && clean.includes(',')) {
    // Si la coma está después del punto, es formato europeo/latam (1.250,50)
    if (clean.indexOf('.') < clean.indexOf(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato US (1,250.50)
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    // Si solo tiene comas:
    // Podría ser decimal sin miles (ej: "45,50") o miles sin decimal (ej: "1,250")
    // Revisamos la posición de la coma desde el final. Si está a 2 o 1 dígitos del final, asumimos que es decimal.
    const parts = clean.split(',');
    if (parts[parts.length - 1].length <= 2) {
      clean = clean.replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
  }
  
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
};

/**
 * Intenta adivinar y formatear una fecha a YYYY-MM-DD.
 * Soporta formatos DD/MM/YYYY, DD-MM-YYYY, DD/MM, y DD de Mes.
 */
const parseDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  const currentYear = new Date().getFullYear();
  const monthsMap = {
    ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
    jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12'
  };

  let clean = dateStr.trim().toLowerCase();
  
  // Caso 1: DD/MM/YYYY o DD-MM-YYYY o DD/MM/YY
  const match1 = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match1) {
    let day = match1[1].padStart(2, '0');
    let month = match1[2].padStart(2, '0');
    let year = match1[3];
    if (year.length === 2) {
      year = '20' + year;
    }
    return `${year}-${month}-${day}`;
  }

  // Caso 2: DD/MM o DD-MM (Sin año)
  const match2 = clean.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (match2) {
    let day = match2[1].padStart(2, '0');
    let month = match2[2].padStart(2, '0');
    return `${currentYear}-${month}-${day}`;
  }

  // Caso 3: DD de MMM o DD MMM (ej: "15 mayo" o "04 de jun")
  const match3 = clean.match(/^(\d{1,2})\s+(?:de\s+)?(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*/);
  if (match3) {
    let day = match3[1].padStart(2, '0');
    let monthWord = match3[2];
    let month = monthsMap[monthWord] || '01';
    return `${currentYear}-${month}-${day}`;
  }

  return new Date().toISOString().split('T')[0];
};

/**
 * Sugiere una categoría según palabras clave de la descripción.
 */
const suggestCategoryId = (description, categories) => {
  const desc = description.toLowerCase();
  
  const keywordMap = {
    'comida': [
      'super', 'walmart', 'jumbo', 'lider', 'oxxo', 'tottus', 'comida', 'restaurante', 'mcdonald', 'starbucks', 'cafe', 'food', 
      'rappi', 'pedidosya', 'uber eats', 'delivery', 'sushi', 'pizza', 'burger', 'panaderia', 'almacen', 'minimarket', 'unimarc', 
      'santa isabel', 'sirena', 'nacional', 'bravo', 'apreciado', 'carrefour', 'pola', 'sedano', 'ole', 'olme', 'grillo', 
      'comercial', 'colmado', 'picadera', 'empanada', 'hotdog', 'hot dog', 'wendys', 'burger king', 'kfc', 'taco bell', 
      'pica pollo', 'papas fritas', 'subway', 'pasteleria', 'reposteria', 'heladeria', 'bon', 'baskin', 'dunkin'
    ],
    'combustible': [
      'shell', 'isla dom', 'total', 'sunix', 'marti petroleum', 'texaco', 'next', 'sigma', 'eco pet', 'petromovil', 
      'petronan', 'tropigas', 'propagás', 'propagas', 'combustible', 'gasol', 'gasolina', 'gasoil', 'estacion de servicio', 
      'estación de servicio', 'copec', 'petrobras'
    ],
    'transporte': [
      'uber', 'didi', 'cabify', 'taxi', 'metro', 'peaje', 'autopista', 'transantiago', 'bip', 'tarjeta bip', 
      'indrive', 'pasaje', 'concho', 'corredor'
    ],
    'servicios': [
      'luz', 'agua', 'gas', 'electric', 'netlife', 'vtr', 'claro', 'entel', 'movistar', 'wom', 'telefon', 'internet', 
      'sencillito', 'servipag', 'enel', 'cge', 'aguas', 'netflix', 'spotify', 'hbo', 'disney', 'suscrip', 'caasd', 
      'edeeste', 'edesur', 'edenorte', 'altice', 'tricom', 'wind', 'seguro', 'basura', 'telecable', 'aster'
    ],
    'entretenimiento': [
      'cine', 'ticket', 'steam', 'playstation', 'nintendo', 'games', 'teatro', 'concierto', 'pub', 'bar', 'discoteca', 
      'evento', 'downtown', 'blue mall', 'sambil', 'galeria 360', 'galerias 360', 'acropolis', 'plaza central', 'megacentro', 
      'bella vista mall', 'agora mall', 'agora', 'colinas mall', 'caribbean cinemas', 'cinemas', 'palacio del cine', 'imax', 
      'drink', 'licor', 'liquor', 'cerveza', 'beer', 'club', 'loung', 'lounge', 'terraza', 'billar', 'karaoke', 'casino', 'boleta'
    ],
    'salud': [
      'farmacia', 'cruz verde', 'ahumada', 'salcobrand', 'clinica', 'medico', 'dental', 'doctor', 'hospital', 'psicolog', 
      'optica', 'laboratorio', 'fonasa', 'isapre', 'carol', 'gads', 'pps', 'medicamento', 'dentista', 'odontolog', 
      'clínica', 'humano', 'senasa', 'universal'
    ],
    'compras': [
      'tienda', 'retail', 'falabella', 'ripley', 'paris', 'h&m', 'zara', 'amazon', 'aliexpress', 'shein', 'mercadolibre', 
      'ml', 'decathlon', 'easy', 'sodimac', 'mall', 'ropa', 'calzado', 'bazar', 'comercio', 'juguete', 'ferreteria', 
      'ikea', 'miniso', 'novus', 'payless', 'multicentro', 'tiendas'
    ],
    'educacion': [
      'colegio', 'universidad', 'instituto', 'curso', 'udemy', 'coursera', 'libro', 'matricula', 'mensualidad', 
      'pension', 'escolar', 'escuela', 'colegiatura', 'utiles', 'útiles', 'papeleria', 'cuaderno'
    ]
  };

  for (const [catName, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => desc.includes(kw))) {
      // Buscar la categoría que coincida con el nombre
      const matched = categories.find(c => c.name.toLowerCase().includes(catName) || catName.includes(c.name.toLowerCase()));
      if (matched) return matched.id;
    }
  }
  return null;
};
/**
 * POST /api/transactions-import/import-pdf
 * Recibe un PDF de estado de cuenta bancaria y extrae las transacciones potenciales.
 */
export const parsePDFStatement = async (req, res, next) => {
  if (!req.file) {
    const err = new Error('No se ha subido ningún archivo PDF');
    err.statusCode = 400;
    return next(err);
  }

  try {
    // 1. Extraer texto del buffer del PDF (usando la API de la versión moderna de pdf-parse)
    const parser = new pdf.PDFParse(new Uint8Array(req.file.buffer));
    await parser.load();
    const result = await parser.getText();
    const text = result.text;

    // Guardar el texto extraído para diagnóstico
    const fs = require('fs');
    fs.writeFileSync('parsed_text.txt', text, 'utf8');

    // 2. Obtener categorías activas de la base de datos para sugerencias de categorización
    const categoriesResult = await query('SELECT id, name, type FROM categories WHERE user_id = $1 OR user_id IS NULL', [req.user.id]);
    const categories = categoriesResult.rows;

    const otherExpenseCat = categories.find(c => c.name.toLowerCase().includes('otros') && c.type === 'expense') || categories.find(c => c.type === 'expense');
    const otherIncomeCat = categories.find(c => c.name.toLowerCase().includes('otros') && c.type === 'income') || categories.find(c => c.type === 'income');

    const getImportCategoryId = (type, description) => {
      if (type === 'expense') {
        return suggestCategoryId(description, categories) || (otherExpenseCat ? otherExpenseCat.id : null);
      } else {
        return (otherIncomeCat ? otherIncomeCat.id : (categories.find(c => c.type === 'income')?.id || null));
      }
    };

    const parsedTransactions = [];

    const cleanDescription = (desc) => {
      return desc
        .replace(/[\*\#\-\:\;\_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    if (text.includes('\t')) {
      // --- MODO TAB-DELIMITED (Popular, Banreservas, etc.) ---
      const lines = text.split('\n');
      let currentTx = null;
      const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const line = rawLine.trim();
        if (!line) continue;

        // Omitir cabeceras o líneas de paginación
        if (line.includes('Fecha \tComentarios') || 
            line.includes('--') || 
            line.toLowerCase().includes('titular:') || 
            line.toLowerCase().includes('número de cuenta') || 
            line.toLowerCase().includes('movimientos') || 
            line.toLowerCase().includes('fecha del reporte') ||
            line.toLowerCase().includes('saldo anterior') ||
            line.toLowerCase().includes('resumen de su') ||
            line.toLowerCase().includes('alias') ||
            line.includes('Estado de Cuenta')) {
          continue;
        }

        const columns = rawLine.split('\t').map(c => c.trim());
        const dateMatch = columns[0] ? columns[0].match(dateRegex) : null;

        if (dateMatch) {
          currentTx = null;

          const dateStr = dateMatch[0];
          const parsedDate = parseDate(dateStr);
          
          const extraDesc = columns[0].substring(dateStr.length).trim();
          let description = extraDesc ? extraDesc + ' ' + (columns[1] || '') : (columns[1] || '');

          const currencyIndices = [];
          columns.forEach((col, idx) => {
            if (col === 'RD$' || col === '$') {
              currencyIndices.push(idx);
            }
          });

          if (currencyIndices.length >= 2) {
            const amountIdx = currencyIndices[0] + 1;
            const balanceIdx = currencyIndices[1] + 1;
            
            const rawAmount = columns[amountIdx];
            const rawBalance = columns[balanceIdx];
            
            if (rawAmount && rawBalance) {
              const amountVal = parseMoneyAmount(rawAmount);
              const isExpense = rawAmount.includes('-');
              const type = isExpense ? 'expense' : 'income';
              
              const category_id = getImportCategoryId(type, description);

              parsedTransactions.push({
                date: parsedDate,
                description: cleanDescription(description),
                amount: Math.abs(amountVal),
                type,
                category_id
              });
            }
          } else {
            currentTx = {
              date: parsedDate,
              descriptionParts: [description]
            };
          }
        } else {
          if (currentTx) {
            const currencyIndices = [];
            columns.forEach((col, idx) => {
              if (col === 'RD$' || col === '$') {
                currencyIndices.push(idx);
              }
            });

            if (currencyIndices.length >= 2) {
              const amountIdx = currencyIndices[0] + 1;
              const balanceIdx = currencyIndices[1] + 1;
              
              const rawAmount = columns[amountIdx];
              const rawBalance = columns[balanceIdx];
              
              if (rawAmount && rawBalance) {
                const amountVal = parseMoneyAmount(rawAmount);
                const isExpense = rawAmount.includes('-');
                const type = isExpense ? 'expense' : 'income';
                const description = currentTx.descriptionParts.join(' ');

                const category_id = getImportCategoryId(type, description);
                
                parsedTransactions.push({
                  date: currentTx.date,
                  description: cleanDescription(description),
                  amount: Math.abs(amountVal),
                  type,
                  category_id
                });
                
                currentTx = null;
              }
            } else {
              const descText = columns.join(' ').trim();
              if (descText && !descText.includes('Fecha') && !descText.includes('Balance')) {
                currentTx.descriptionParts.push(descText);
              }
            }
          }
        }
      }
    } else {
      // --- MODO REGEX LÍNEA POR LÍNEA (Banreservas / Otros) ---
      const lines = text.split('\n');
      let currentTx = null;

      // Expresiones regulares ancladas al inicio de la línea para detectar fechas
      const dateRegex1Anchored = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/; // DD/MM/YYYY
      const dateRegex2Anchored = /^(\d{1,2})[\/\-](\d{1,2})/; // DD/MM
      const dateRegex3Anchored = /^(\d{1,2})\s+(?:de\s+)?(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*/i; // DD de mes
      
      // Regex para montos finales al extremo derecho de la línea (monto_movimiento balance_acumulado)
      const singleLineAmountsRegex = /\s+([\-\+]?\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))\s+(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))\s*$/;
      const finalAmountsRegex = /^\s*([\-\+]?\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))\s+(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))\s*$/;

      const determineType = (amountVal, rawAmountStr) => {
        if (rawAmountStr.includes('-') || amountVal < 0) {
          return 'expense';
        }
        return 'income';
      };

      for (let rawLine of lines) {
        const line = rawLine.trim();
        
        // Omitir líneas vacías o de cabecera/resumen
        if (!line) continue;
        if (line.toLowerCase().includes('titular:') || 
            line.toLowerCase().includes('número de cuenta') || 
            line.toLowerCase().includes('movimientos') || 
            line.toLowerCase().includes('fecha del reporte') ||
            line.toLowerCase().includes('--') ||
            line.toLowerCase().includes('página') ||
            line.toLowerCase().includes('saldo anterior') ||
            line.toLowerCase().includes('resumen de su') ||
            line.toLowerCase().includes('alias')) {
          continue;
        }

        // A. Comprobar si la línea comienza con una fecha de transacción
        const dateMatch = line.match(dateRegex1Anchored) || line.match(dateRegex3Anchored) || line.match(dateRegex2Anchored);

        if (dateMatch) {
          currentTx = null;

          const dateStr = dateMatch[0];
          const parsedDate = parseDate(dateStr);
          const remainingText = line.substring(dateStr.length).trim();

          const amountMatch = remainingText.match(singleLineAmountsRegex);

          if (amountMatch) {
            const rawAmount = amountMatch[1];
            const amountVal = parseMoneyAmount(rawAmount);
            const description = remainingText.substring(0, remainingText.length - amountMatch[0].length).trim();

            const type = determineType(amountVal, rawAmount);
            const category_id = getImportCategoryId(type, description);

            parsedTransactions.push({
              date: parsedDate,
              description: cleanDescription(description),
              amount: Math.abs(amountVal),
              type,
              category_id
            });
          } else {
            currentTx = {
              date: parsedDate,
              descriptionParts: [remainingText],
              amount: null
            };
          }
        } else {
          if (currentTx) {
            const amountMatch = line.match(finalAmountsRegex);

            if (amountMatch) {
              const rawAmount = amountMatch[1];
              const amountVal = parseMoneyAmount(rawAmount);
              const description = currentTx.descriptionParts.join(' ').trim();

              const type = determineType(amountVal, rawAmount);
              const category_id = getImportCategoryId(type, description);

              parsedTransactions.push({
                date: currentTx.date,
                description: cleanDescription(description),
                amount: Math.abs(amountVal),
                type,
                category_id
              });

              currentTx = null;
            } else {
              currentTx.descriptionParts.push(line);
            }
          }
        }
      }
    }

    // Filtrar y omitir traspasos propios (propia, traspaso, pago tarjeta, tubancoap)
    const filteredTransactions = parsedTransactions.filter(t => {
      const desc = (t.description || '').toLowerCase();
      const keywords = ['propia', 'traspaso', 'pago tarjeta', 'tubancoap'];
      return !keywords.some(kw => desc.includes(kw));
    });

    // Ordenar de más reciente a más antiguo por defecto
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      count: filteredTransactions.length,
      transactions: filteredTransactions
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/transactions-import/bulk
 * Registra múltiples transacciones enviadas en un lote en una sola transacción de base de datos.
 */
export const bulkInsertTransactions = async (req, res, next) => {
  const { transactions } = req.body;

  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    const err = new Error('Se requiere un arreglo de transacciones no vacío');
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Validar formato de cada transacción en el lote
    for (const t of transactions) {
      if (t.amount === undefined || !t.description || !t.type || !t.date) {
        const err = new Error('Cada transacción del lote debe contener monto, descripción, tipo y fecha');
        err.statusCode = 400;
        return next(err);
      }
      
      const numAmount = parseFloat(t.amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        const err = new Error('El monto de cada transacción debe ser un número positivo');
        err.statusCode = 400;
        return next(err);
      }

      if (t.type !== 'income' && t.type !== 'expense') {
        const err = new Error('El tipo debe ser "income" o "expense"');
        err.statusCode = 400;
        return next(err);
      }
    }

    // Iniciar transacción de base de datos para asegurar atomicidad
    await query('BEGIN');

    const insertedTransactions = [];

    for (const t of transactions) {
      const sql = `
        INSERT INTO transactions (amount, description, type, date, category_id, bank_account_id, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const params = [
        parseFloat(t.amount),
        t.description.trim(),
        t.type,
        t.date,
        t.category_id || null,
        t.bank_account_id || null,
        req.user.id
      ];

      const result = await query(sql, params);
      insertedTransactions.push(result.rows[0]);
    }

    // Confirmar transacción SQL
    await query('COMMIT');

    res.status(201).json({
      success: true,
      count: insertedTransactions.length,
      transactions: insertedTransactions
    });

  } catch (error) {
    // Deshacer la transacción SQL si ocurre algún error
    try {
      await query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error al ejecutar ROLLBACK:', rollbackError);
    }
    next(error);
  }
};
