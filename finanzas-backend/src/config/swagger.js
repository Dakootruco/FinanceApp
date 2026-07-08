const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API de Finanzas Personales",
    version: "1.0.0",
    description: "Documentación interactiva de la API para el control de finanzas personales. Permite consultar, registrar y eliminar transacciones y categorías, además de ver resúmenes financieros agregados.",
    contact: {
      name: "Soporte de Desarrollo"
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor de Desarrollo Local"
    }
  ],
  paths: {
    "/health": {
      get: {
        summary: "Obtener estado de salud del servidor",
        description: "Retorna el estado de salud de la API y verifica la conexión activa con la base de datos PostgreSQL.",
        responses: {
          200: {
            description: "API en funcionamiento y base de datos conectada correctamente.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    message: { type: "string", example: "API de Finanzas Personales funcionando correctamente" },
                    dbTime: { type: "string", format: "date-time", example: "2026-06-07T08:00:00.000Z" }
                  }
                }
              }
            }
          },
          500: {
            description: "Error interno o falla de conexión con la base de datos."
          }
        }
      }
    },
    "/api/categories": {
      get: {
        summary: "Obtener todas las categorías",
        description: "Retorna la lista completa de categorías ordenadas por tipo e ingresadas en el sistema.",
        responses: {
          200: {
            description: "Listado de categorías obtenido correctamente.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Category"
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Crear una nueva categoría",
        description: "Crea una categoría personalizada (Ingreso o Gasto) con un icono y color definidos.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "type"],
                properties: {
                  name: { type: "string", example: "Comida" },
                  type: { type: "string", enum: ["income", "expense"], example: "expense" },
                  icon: { type: "string", example: "shopping-bag" },
                  color: { type: "string", example: "#f43f5e" }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Categoría creada exitosamente.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Category"
                }
              }
            }
          },
          400: {
            description: "Error de validación o categoría con nombre duplicado."
          }
        }
      }
    },
    "/api/categories/{id}": {
      "put": {
        "summary": "Actualizar una categoría existente",
        "description": "Modifica el nombre, tipo, icono o color de una categoría por su ID.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID de la categoría a actualizar",
            "required": true,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "type"],
                "properties": {
                  "name": { "type": "string", "example": "Supermercado y Comida" },
                  "type": { "type": "string", "enum": ["income", "expense"], "example": "expense" },
                  "icon": { "type": "string", "example": "shopping-bag" },
                  "color": { "type": "string", "example": "#ef4444" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Categoría actualizada exitosamente.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Category"
                }
              }
            }
          },
          "400": {
            "description": "Error de validación o conflicto de nombres."
          },
          "404": {
            "description": "La categoría no existe."
          }
        }
      },
      "delete": {
        "summary": "Eliminar una categoría por ID",
        "description": "Elimina permanentemente una categoría. Al eliminarla, sus transacciones asociadas quedarán sin categoría (NULL) y su presupuesto asociado se eliminará en cascada.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID de la categoría a eliminar",
            "required": true,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Categoría eliminada correctamente.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Categoría eliminada correctamente" },
                    "category": {
                      "$ref": "#/components/schemas/Category"
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "La categoría no existe."
          }
        }
      }
    },
    "/api/transactions": {
      get: {
        summary: "Obtener listado de transacciones",
        description: "Retorna el historial de transacciones ordenadas por fecha más reciente, soportando filtros de tipo, categoría y rango de fechas.",
        parameters: [
          {
            name: "type",
            in: "query",
            description: "Filtrar por tipo de transacción (income o expense)",
            required: false,
            schema: {
              type: "string",
              enum: ["income", "expense"]
            }
          },
          {
            name: "category_id",
            in: "query",
            description: "Filtrar por ID de la categoría",
            required: false,
            schema: {
              type: "integer"
            }
          },
          {
            name: "startDate",
            in: "query",
            description: "Fecha de inicio para el rango de filtros (Formato YYYY-MM-DD)",
            required: false,
            schema: {
              type: "string",
              format: "date",
              example: "2026-06-01"
            }
          },
          {
            name: "endDate",
            in: "query",
            description: "Fecha de fin para el rango de filtros (Formato YYYY-MM-DD)",
            required: false,
            schema: {
              type: "string",
              format: "date",
              example: "2026-06-30"
            }
          }
        ],
        responses: {
          200: {
            description: "Listado de transacciones obtenido exitosamente.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Transaction"
                  }
                }
              }
            }
          },
          400: {
            description: "Parámetros de consulta inválidos."
          }
        }
      },
      post: {
        summary: "Registrar una nueva transacción",
        description: "Inserta una nueva transacción financiera (gasto o ingreso) asociada a una categoría válida del mismo tipo.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount", "description", "type"],
                properties: {
                  amount: { type: "number", format: "float", example: 125.50 },
                  description: { type: "string", example: "Compra de víveres" },
                  type: { type: "string", enum: ["income", "expense"], example: "expense" },
                  date: { type: "string", format: "date", example: "2026-06-07" },
                  category_id: { type: "integer", example: 1 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Transacción registrada exitosamente.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Transaction"
                }
              }
            }
          },
          400: {
            description: "Monto inválido, categoría no encontrada o discordancia de tipos."
          }
        }
      }
    },
    "/api/transactions/{id}": {
      put: {
        summary: "Actualizar una transacción por ID (p. ej., cambiar su categoría)",
        description: "Permite modificar la categoría asociada a la transacción.",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "ID de la transacción a actualizar",
            required: true,
            schema: {
              type: "integer"
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "category_id": { "type": "integer", "example": 3, "nullable": true }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Transacción actualizada correctamente.",
            content: {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Transaction"
                }
              }
            }
          },
          400: { "description": "La categoría especificada no existe." },
          404: { "description": "La transacción no existe." }
        }
      },
      delete: {
        summary: "Eliminar una transacción por ID",
        description: "Elimina permanentemente una transacción registrada en el sistema.",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "ID único de la transacción a eliminar",
            required: true,
            schema: {
              type: "integer"
            }
          }
        ],
        responses: {
          200: {
            description: "Transacción eliminada exitosamente.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Transacción eliminada correctamente" },
                    transaction: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 5 },
                        amount: { type: "number", example: 125.50 },
                        description: { type: "string", example: "Compra de víveres" }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: "La transacción con el ID provisto no existe."
          }
        }
      }
    },
    "/api/dashboard": {
      get: {
        summary: "Obtener datos consolidados del dashboard",
        description: "Retorna el balance acumulado (ingresos vs gastos totales), desglose de gastos por categoría, e historial de meses para gráficos.",
        responses: {
          200: {
            description: "Métricas obtenidas correctamente.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    summary: {
                      type: "object",
                      properties: {
                        totalIncome: { type: "number", example: 55000 },
                        totalExpenses: { type: "number", example: 22000 },
                        balance: { type: "number", example: 33000 }
                      }
                    },
                    expensesByCategory: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category_id: { type: "integer", example: 1 },
                          category_name: { type: "string", example: "Comida" },
                          category_color: { type: "string", example: "#f43f5e" },
                          category_icon: { type: "string", example: "shopping-bag" },
                          total: { type: "number", example: 12500 }
                        }
                      }
                    },
                    monthlyHistory: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          month: { type: "string", example: "2026-06" },
                          income: { type: "number", example: 45000 },
                          expense: { type: "number", example: 18000 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
  "/api/budgets": {
    "get": {
      "summary": "Obtener todos los presupuestos",
      "description": "Retorna la lista de presupuestos configurados con los detalles de sus categorías de gasto asociadas.",
      "responses": {
        "200": {
          "description": "Listado de presupuestos obtenido correctamente.",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Budget"
                }
              }
            }
          }
        }
      }
    },
    "post": {
      "summary": "Registrar o actualizar el presupuesto de una categoría",
      "description": "Establece o actualiza el límite de gasto mensual para una categoría específica. Si la categoría ya tiene un presupuesto, lo sobrescribe.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["category_id", "limit_amount"],
              "properties": {
                "category_id": { "type": "integer", "example": 5 },
                "limit_amount": { "type": "number", "format": "float", "example": 5000.00 }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Presupuesto registrado o actualizado correctamente.",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Budget"
              }
            }
          }
        },
        "400": {
          "description": "Límite inválido o la categoría no es de tipo gasto."
        },
        "404": {
          "description": "La categoría especificada no existe."
        }
      }
    }
  },
  "/api/budgets/{id}": {
    "delete": {
      "summary": "Eliminar un presupuesto por ID",
      "description": "Elimina el límite de presupuesto de una categoría.",
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "description": "ID del presupuesto a eliminar",
          "required": true,
          "schema": {
            "type": "integer"
          }
        }
      ],
      "responses": {
        "200": {
          "description": "Presupuesto eliminado exitosamente.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": { "type": "string", "example": "Presupuesto eliminado correctamente" },
                  "budget": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "integer", "example": 1 },
                      "category_id": { "type": "integer", "example": 5 },
                      "limit_amount": { "type": "number", "example": 5000.00 }
                    }
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Presupuesto no encontrado."
        }
      }
    }
  },
  "/api/investments": {
    "get": {
      "summary": "Obtener todas las inversiones",
      "description": "Retorna la lista de inversiones registradas, con cálculos dinámicos de valor actual y retorno neto en tiempo real.",
      "responses": {
        "200": {
          "description": "Listado de inversiones obtenido correctamente.",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Investment"
                }
              }
            }
          }
        }
      }
    },
    "post": {
      "summary": "Registrar una nueva inversión",
      "description": "Registra una nueva inversión especificando nombre, categoría, capital inicial invertido y, opcionalmente, rendimiento porcentual.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["name", "category", "amount_invested"],
              "properties": {
                "name": { "type": "string", "example": "Acciones de Apple" },
                "category": { "type": "string", "enum": ["Bolsa", "Cripto", "Bienes Raíces", "Fondo Mutuo", "Renta Fija", "Otros"], "example": "Bolsa" },
                "amount_invested": { "type": "number", "format": "float", "example": 1000.00 },
                "change_percentage": { "type": "number", "format": "float", "example": 10.00 }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Inversión creada correctamente.",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Investment"
              }
            }
          }
        },
        "400": {
          "description": "Datos de entrada inválidos o categoría no permitida."
        }
      }
    }
  },
  "/api/investments/{id}": {
    "get": {
      "summary": "Obtener detalle de una inversión por ID",
      "description": "Retorna la información de una inversión específica incluyendo cálculos de rendimiento.",
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "description": "ID de la inversión a consultar",
          "required": true,
          "schema": { "type": "integer" }
        }
      ],
      "responses": {
        "200": {
          "description": "Detalle de inversión obtenido.",
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/Investment" }
            }
          }
        },
        "404": { "description": "Inversión no encontrada." }
      }
    },
    "put": {
      "summary": "Actualizar una inversión por ID",
      "description": "Modifica todos los campos principales de una inversión existente.",
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "description": "ID de la inversión a actualizar",
          "required": true,
          "schema": { "type": "integer" }
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["name", "category", "amount_invested", "change_percentage"],
              "properties": {
                "name": { "type": "string", "example": "Acciones de Apple Inc." },
                "category": { "type": "string", "enum": ["Bolsa", "Cripto", "Bienes Raíces", "Fondo Mutuo", "Renta Fija", "Otros"], "example": "Bolsa" },
                "amount_invested": { "type": "number", "format": "float", "example": 1200.00 },
                "change_percentage": { "type": "number", "format": "float", "example": 15.50 }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Inversión actualizada correctamente.",
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/Investment" }
            }
          }
        },
        "404": { "description": "Inversión no encontrada." }
      }
    },
    "delete": {
      "summary": "Eliminar una inversión por ID",
      "description": "Remueve el registro de inversión por completo.",
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "description": "ID de la inversión a eliminar",
          "required": true,
          "schema": { "type": "integer" }
        }
      ],
      "responses": {
        "200": {
          "description": "Inversión eliminada correctamente."
        },
        "404": { "description": "Inversión no encontrada." }
      }
    }
  },
  "/api/investments/{id}/adjust-amount": {
    "patch": {
      "summary": "Ajustar capital invertido (añadir o retirar capital)",
      "description": "Permite aumentar el capital invertido (amount positivo) o retirar capital (amount negativo) de una inversión.",
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "description": "ID de la inversión a ajustar",
          "required": true,
          "schema": { "type": "integer" }
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["amount"],
              "properties": {
                "amount": { "type": "number", "format": "float", "example": 500.00 }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Capital ajustado correctamente.",
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/Investment" }
            }
          }
        },
        "400": { "description": "Monto inválido o retiro excede el capital disponible." },
        "404": { "description": "Inversión no encontrada." }
      }
    }
  },
  "/api/investments/{id}/adjust-percentage": {
    "patch": {
      "summary": "Ajustar rendimiento porcentual",
      "description": "Establece directamente el nuevo porcentaje de cambio de rentabilidad/valorización para la inversión.",
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "description": "ID de la inversión a ajustar",
          "required": true,
          "schema": { "type": "integer" }
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["change_percentage"],
              "properties": {
                "change_percentage": { "type": "number", "format": "float", "example": -5.50 }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Porcentaje de rendimiento actualizado correctamente.",
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/Investment" }
            }
          }
        },
        "400": { "description": "Porcentaje inválido." },
        "404": { "description": "Inversión no encontrada." }
      }
    }
  },
  "/api/credit-cards": {
    "get": {
      "summary": "Obtener todas las tarjetas de crédito",
      "description": "Retorna la lista de tarjetas de crédito registradas en el sistema.",
      "responses": {
        "200": {
          "description": "Listado de tarjetas obtenido correctamente.",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/CreditCard"
                }
              }
            }
          }
        }
      }
    },
    "post": {
      "summary": "Registrar una nueva tarjeta de crédito",
      "description": "Registra una nueva tarjeta de crédito con su banco, marca, últimos 4 dígitos, saldo inicial y tema de color.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["card_name", "bank", "brand", "last_digits"],
              "properties": {
                "card_name": { "type": "string", "example": "Visa Platinum Plus" },
                "bank": { "type": "string", "example": "Visa Bank" },
                "brand": { "type": "string", "enum": ["Visa", "Mastercard", "American Express", "Otro"], "example": "Visa" },
                "last_digits": { "type": "string", "example": "9967" },
                "balance": { "type": "number", "format": "float", "example": 415000.00 },
                "color_theme": { "type": "string", "example": "#121620" }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Tarjeta creada correctamente.",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreditCard"
              }
            }
          }
        },
        "400": {
          "description": "Datos de entrada inválidos o formato incorrecto."
        }
      }
    }
  },
  "/api/credit-cards/{id}": {
    "get": {
      "summary": "Obtener una tarjeta de crédito por ID",
      "description": "Retorna los detalles de una tarjeta de crédito específica.",
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "description": "ID de la tarjeta a consultar",
          "required": true,
          "schema": { "type": "integer" }
        }
      ],
      "responses": {
        "200": {
          "description": "Detalle de tarjeta obtenido.",
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreditCard" }
            }
          }
        },
        "404": { "description": "Tarjeta no encontrada." }
      }
    },
    "put": {
      "summary": "Actualizar una tarjeta de crédito por ID",
      "description": "Modifica todos los campos principales de una tarjeta de crédito existente.",
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "description": "ID de la tarjeta a actualizar",
          "required": true,
          "schema": { "type": "integer" }
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["card_name", "bank", "brand", "last_digits", "balance"],
              "properties": {
                "card_name": { "type": "string", "example": "Visa Platinum Plus Updated" },
                "bank": { "type": "string", "example": "Visa Bank" },
                "brand": { "type": "string", "enum": ["Visa", "Mastercard", "American Express", "Otro"], "example": "Visa" },
                "last_digits": { "type": "string", "example": "9967" },
                "balance": { "type": "number", "format": "float", "example": 450000.00 },
                "color_theme": { "type": "string", "example": "#121620" }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Tarjeta actualizada correctamente.",
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreditCard" }
            }
          }
        },
        "404": { "description": "Tarjeta no encontrada." }
      }
    },
    "delete": {
      "summary": "Eliminar una tarjeta de crédito por ID",
      "description": "Remueve el registro de la tarjeta de crédito del sistema.",
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "description": "ID de la tarjeta a eliminar",
          "required": true,
          "schema": { "type": "integer" }
        }
      ],
      "responses": {
        "200": { "description": "Tarjeta eliminada correctamente." },
        "404": { "description": "Tarjeta no encontrada." }
      }
    }
  },
    "/api/savings-goals": {
      "get": {
        "summary": "Obtener todos los objetivos de ahorro",
        "description": "Retorna la lista de planes de ahorro (objetivos) registrados en el sistema.",
        "responses": {
          "200": {
            "description": "Listado de objetivos obtenido correctamente.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/SavingsGoal"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Registrar un nuevo objetivo de ahorro",
        "description": "Registra una nueva meta de ahorro con su nombre, monto meta, saldo inicial y tema de color.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "target_amount"],
                "properties": {
                  "name": { "type": "string", "example": "Fondo de Emergencia" },
                  "target_amount": { "type": "number", "format": "float", "example": 10000.00 },
                  "current_amount": { "type": "number", "format": "float", "example": 4500.00 },
                  "color_theme": { "type": "string", "example": "#6366f1" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Objetivo de ahorro creado correctamente.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SavingsGoal"
                }
              }
            }
          },
          "400": {
            "description": "Datos de entrada inválidos o formato incorrecto."
          }
        }
      }
    },
    "/api/savings-goals/{id}": {
      "get": {
        "summary": "Obtener un objetivo de ahorro por ID",
        "description": "Retorna los detalles de un objetivo de ahorro específico.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID del objetivo a consultar",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Detalle del objetivo obtenido.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/SavingsGoal" }
              }
            }
          },
          "404": { "description": "Objetivo de ahorro no encontrado." }
        }
      },
      "put": {
        "summary": "Actualizar un objetivo de ahorro por ID",
        "description": "Modifica todos los campos principales de un objetivo de ahorro existente.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID del objetivo a actualizar",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "target_amount", "current_amount"],
                "properties": {
                  "name": { "type": "string", "example": "Fondo de Emergencia Actualizado" },
                  "target_amount": { "type": "number", "format": "float", "example": 12000.00 },
                  "current_amount": { "type": "number", "format": "float", "example": 5000.00 },
                  "color_theme": { "type": "string", "example": "#6366f1" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Objetivo de ahorro actualizado correctamente.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/SavingsGoal" }
              }
            }
          },
          "404": { "description": "Objetivo de ahorro no encontrado." }
        }
      },
      "delete": {
        "summary": "Eliminar un objetivo de ahorro por ID",
        "description": "Remueve el registro del objetivo de ahorro del sistema.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID del objetivo a eliminar",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Objetivo de ahorro eliminado correctamente."
          },
          "404": { "description": "Objetivo de ahorro no encontrado." }
        }
      }
    },
    "/api/savings-goals/{id}/adjust-amount": {
      "patch": {
        "summary": "Ajustar saldo ahorrado (añadir o retirar ahorros)",
        "description": "Permite aumentar el monto ahorrado actual (amount positivo) o retirar ahorros (amount negativo) de un objetivo.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID del objetivo a ajustar",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["amount"],
                "properties": {
                  "amount": { "type": "number", "format": "float", "example": 500.00 }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Saldo de ahorro ajustado correctamente.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/SavingsGoal" }
              }
            }
          },
          "400": { "description": "Monto inválido o el retiro excede el saldo ahorrado disponible." },
          "404": { "description": "Objetivo de ahorro no encontrado." }
        }
      }
    },
    "/api/transactions-import/import-pdf": {
      "post": {
        "summary": "Importar movimientos desde archivo PDF",
        "description": "Procesa un archivo PDF de estado de cuenta bancario en memoria y extrae la lista de transacciones potenciales.",
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "required": ["file"],
                "properties": {
                  "file": {
                    "type": "string",
                    "format": "binary",
                    "description": "Archivo PDF del estado de cuenta bancaria"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Lista de transacciones potenciales detectadas en el PDF.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "count": { "type": "integer", "example": 12 },
                    "transactions": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "date": { "type": "string", "format": "date", "example": "2026-06-08" },
                          "description": { "type": "string", "example": "WALMART SUPER" },
                          "amount": { "type": "number", "format": "float", "example": 25.50 },
                          "type": { "type": "string", "enum": ["income", "expense"], "example": "expense" },
                          "category_id": { "type": "integer", "example": 3, "nullable": true }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": { "description": "Formato de archivo inválido o error en el procesamiento." }
        }
      }
    },
    "/api/transactions-import/bulk": {
      "post": {
        "summary": "Registrar múltiples transacciones en lote",
        "description": "Inserta un array de transacciones confirmadas a la base de datos de manera atómica.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["transactions"],
                "properties": {
                  "transactions": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": ["amount", "description", "type", "date"],
                      "properties": {
                        "amount": { "type": "number", "format": "float", "example": 25.50 },
                        "description": { "type": "string", "example": "WALMART SUPER" },
                        "type": { "type": "string", "enum": ["income", "expense"], "example": "expense" },
                        "date": { "type": "string", "format": "date", "example": "2026-06-08" },
                        "category_id": { "type": "integer", "example": 3, "nullable": true }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Transacciones del lote creadas exitosamente.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "count": { "type": "integer", "example": 10 },
                    "transactions": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Transaction"
                      }
                    }
                  }
                }
              }
            }
          },
          "400": { "description": "Datos de entrada inválidos en alguna transacción." }
        }
      }
    },
    "/api/bank-accounts": {
      "get": {
        "summary": "Obtener todas las cuentas bancarias",
        "description": "Retorna la lista completa de las cuentas bancarias registradas en el sistema ordenadas por nombre.",
        "responses": {
          "200": {
            "description": "Listado de cuentas bancarias obtenido correctamente.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/BankAccount"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Registrar una nueva cuenta bancaria",
        "description": "Crea una nueva cuenta bancaria en el sistema para asociar movimientos financieros.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "bank_name", "last_digits"],
                "properties": {
                  "name": { "type": "string", "example": "Cuenta Ahorros Popular" },
                  "bank_name": { "type": "string", "example": "Banco Popular" },
                  "last_digits": { "type": "string", "example": "1234" },
                  "balance": { "type": "number", "format": "float", "example": 10000.00 }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Cuenta bancaria registrada exitosamente.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BankAccount"
                }
              }
            }
          },
          "400": { "description": "Datos de entrada inválidos o nombre de cuenta ya existente." }
        }
      }
    },
    "/api/bank-accounts/{id}": {
      "get": {
        "summary": "Obtener detalle de una cuenta bancaria",
        "description": "Retorna la información completa de una cuenta bancaria específica por su ID.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "ID único de la cuenta bancaria",
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Detalle de la cuenta obtenido correctamente.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BankAccount"
                }
              }
            }
          },
          "404": { "description": "Cuenta bancaria no encontrada." }
        }
      },
      "put": {
        "summary": "Actualizar una cuenta bancaria",
        "description": "Permite modificar el nombre, banco, últimos dígitos y saldo de una cuenta bancaria existente.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "ID de la cuenta a modificar",
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "bank_name", "last_digits"],
                "properties": {
                  "name": { "type": "string", "example": "Cuenta Corriente BHD" },
                  "bank_name": { "type": "string", "example": "Banco BHD" },
                  "last_digits": { "type": "string", "example": "5678" },
                  "balance": { "type": "number", "format": "float", "example": 48200.00 }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Cuenta bancaria actualizada correctamente.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BankAccount"
                }
              }
            }
          },
          "404": { "description": "Cuenta bancaria no encontrada." },
          "400": { "description": "Validación de datos fallida." }
        }
      },
      "delete": {
        "summary": "Eliminar una cuenta bancaria",
        "description": "Elimina la cuenta bancaria del sistema. Las transacciones asociadas a esta pasarán a tener bank_account_id = null.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "ID de la cuenta a eliminar",
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Cuenta bancaria eliminada exitosamente."
          },
          "404": { "description": "Cuenta bancaria no encontrada." }
        }
      }
    },
    "/api/reports": {
      "get": {
        "summary": "Obtener datos analíticos para reportes avanzados",
        "description": "Retorna KPIs analíticos, desgloses por categoría, datos históricos de meses y métodos de pago dentro de un rango de fechas y filtro de cuenta bancaria.",
        "parameters": [
          {
            "name": "startDate",
            "in": "query",
            "required": false,
            "description": "Fecha de inicio del rango (YYYY-MM-DD)",
            "schema": { "type": "string", "format": "date", "example": "2026-06-01" }
          },
          {
            "name": "endDate",
            "in": "query",
            "required": false,
            "description": "Fecha de fin del rango (YYYY-MM-DD)",
            "schema": { "type": "string", "format": "date", "example": "2026-06-30" }
          },
          {
            "name": "bank_account_id",
            "in": "query",
            "required": false,
            "description": "Filtrar por ID de cuenta bancaria específica ('all' o ID de cuenta)",
            "schema": { "type": "string", "example": "all" }
          }
        ],
        "responses": {
          "200": {
            "description": "Datos analíticos obtenidos correctamente.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "summary": {
                      "type": "object",
                      "properties": {
                        "totalIncome": { "type": "number", "example": 9545.00 },
                        "totalExpenses": { "type": "number", "example": 5746.58 },
                        "savings": { "type": "number", "example": 3798.42 },
                        "savingsRate": { "type": "number", "example": 40 },
                        "avgDailySpend": { "type": "number", "example": 191.55 },
                        "topCategory": {
                          "type": "object",
                          "properties": {
                            "name": { "type": "string", "example": "Comida / Supermercado" },
                            "amount": { "type": "number", "example": 385.00 }
                          }
                        }
                      }
                    },
                    "categories": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": { "type": "integer", "example": 5 },
                          "name": { "type": "string", "example": "Comida / Supermercado" },
                          "color": { "type": "string", "example": "#14B8A6" },
                          "icon": { "type": "string", "example": "shopping-bag" },
                          "total": { "type": "number", "example": 385.00 },
                          "count": { "type": "integer", "example": 1 },
                          "limit_amount": { "type": "number", "example": 10000.00 }
                        }
                      }
                    },
                    "monthly": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "month": { "type": "string", "example": "2026-06" },
                          "income": { "type": "number", "example": 9545.00 },
                          "expense": { "type": "number", "example": 5746.58 }
                        }
                      }
                    },
                    "paymentMethods": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "name": { "type": "string", "example": "Cuenta Ahorros Popular" },
                          "total": { "type": "number", "example": 5746.58 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Comida" },
          type: { type: "string", enum: ["income", "expense"], example: "expense" },
          icon: { type: "string", example: "shopping-bag" },
          color: { type: "string", example: "#f43f5e" }
        }
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "integer", example: 12 },
          amount: { type: "number", format: "float", example: 125.50 },
          description: { type: "string", example: "Compra de víveres" },
          type: { type: "string", enum: ["income", "expense"], example: "expense" },
          date: { type: "string", format: "date", example: "2026-06-07" },
          category_id: { type: "integer", example: 1, nullable: true },
          category_name: { type: "string", example: "Comida", nullable: true },
          category_color: { type: "string", example: "#f43f5e", nullable: true },
          category_icon: { type: "string", example: "shopping-bag", nullable: true },
          bank_account_id: { type: "integer", example: 1, nullable: true },
          bank_account_name: { type: "string", example: "Cuenta Ahorros Popular", nullable: true },
          bank_account_digits: { type: "string", example: "1234", nullable: true }
        }
      },
      Budget: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          category_id: { type: "integer", example: 5 },
          limit_amount: { type: "number", format: "float", example: 5000.00 },
          category_name: { type: "string", example: "Salud" },
          category_color: { type: "string", example: "#ec4899" },
          category_icon: { type: "string", example: "heart" }
        }
      },
      Investment: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Acciones de Apple" },
          category: { type: "string", enum: ["Bolsa", "Cripto", "Bienes Raíces", "Fondo Mutuo", "Renta Fija", "Otros"], example: "Bolsa" },
          amount_invested: { type: "number", format: "float", example: 1000.00 },
          change_percentage: { type: "number", format: "float", example: 10.00 },
          current_value: { type: "number", format: "float", example: 1100.00 },
          net_return: { type: "number", format: "float", example: 100.00 },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" }
        }
      },
      CreditCard: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          card_name: { type: "string", example: "Visa Platinum Plus" },
          bank: { type: "string", example: "Visa Bank" },
          brand: { type: "string", enum: ["Visa", "Mastercard", "American Express", "Otro"], example: "Visa" },
          last_digits: { type: "string", example: "9967" },
          balance: { type: "number", format: "float", example: 415000.00 },
          color_theme: { type: "string", example: "#121620" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" }
        }
      },
      SavingsGoal: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Fondo de Emergencia" },
          target_amount: { type: "number", format: "float", example: 10000.00 },
          current_amount: { type: "number", format: "float", example: 4500.00 },
          color_theme: { type: "string", example: "#6366f1" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" }
        }
      },
      BankAccount: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Cuenta Ahorros Popular" },
          bank_name: { type: "string", example: "Banco Popular" },
          last_digits: { type: "string", example: "1234" },
          balance: { type: "number", format: "float", example: 125500.00 },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" }
        }
      }
    }
  }
};

export default swaggerDocument;
