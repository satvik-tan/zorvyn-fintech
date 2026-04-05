const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Finance Dashboard Backend API",
    version: "1.0.0",
    description: "API documentation for the finance dashboard backend."
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local server"
    }
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Transactions" },
    { name: "Users" },
    { name: "Dashboard" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" }
        }
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          amount: { type: "number" },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
          category: { type: "string" },
          date: { type: "string", format: "date-time" },
          notes: { type: "string", nullable: true },
          isDeleted: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string" }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "User registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          403: {
            description: "Forbidden (admin required)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          409: {
            description: "Duplicate email",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Current user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "List transactions",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
          { in: "query", name: "type", schema: { type: "string", enum: ["INCOME", "EXPENSE"] } },
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "from_date", schema: { type: "string", format: "date-time" } },
          { in: "query", name: "to_date", schema: { type: "string", format: "date-time" } }
        ],
        responses: {
          200: {
            description: "Paginated transaction list"
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" }
        }
      },
      post: {
        tags: ["Transactions"],
        summary: "Create transaction",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount", "type", "category", "date"],
                properties: {
                  amount: { type: "number", minimum: 0.01 },
                  type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                  category: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  notes: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Transaction" }
              }
            }
          },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/transactions/{id}": {
      get: {
        tags: ["Transactions"],
        summary: "Get transaction by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Transaction" },
          404: { description: "Not found" }
        }
      },
      patch: {
        tags: ["Transactions"],
        summary: "Update transaction",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number", minimum: 0.01 },
                  type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                  category: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  notes: { type: "string", nullable: true }
                },
                additionalProperties: false
              },
              examples: {
                updateAmount: {
                  value: {
                    amount: 250.75,
                    notes: "Updated amount"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Updated" },
          400: { description: "Validation error or empty update payload" },
          404: { description: "Not found" }
        }
      },
      delete: {
        tags: ["Transactions"],
        summary: "Soft delete transaction",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Deleted" },
          404: { description: "Not found" }
        }
      }
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users (ADMIN)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Paginated users" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID (ADMIN)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "User" },
          404: { description: "Not found" }
        }
      },
      patch: {
        tags: ["Users"],
        summary: "Update user (ADMIN)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
                  isActive: { type: "boolean" }
                },
                additionalProperties: false
              },
              examples: {
                promoteUser: {
                  value: {
                    role: "ANALYST",
                    isActive: true
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Updated" },
          400: { description: "Validation error" },
          404: { description: "Not found" }
        }
      },
      delete: {
        tags: ["Users"],
        summary: "Deactivate user (ADMIN)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Deactivated" },
          400: { description: "Bad request" },
          404: { description: "Not found" }
        }
      }
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get full dashboard snapshot",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Snapshot" }
        }
      }
    },
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Get summary",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Summary" }
        }
      }
    },
    "/api/dashboard/categories": {
      get: {
        tags: ["Dashboard"],
        summary: "Get category breakdown",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Categories" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/dashboard/trends": {
      get: {
        tags: ["Dashboard"],
        summary: "Get monthly trends",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Trends" }
        }
      }
    },
    "/api/dashboard/recent": {
      get: {
        tags: ["Dashboard"],
        summary: "Get recent transactions",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Recent activity" }
        }
      }
    }
  }
};

module.exports = {
  swaggerSpec
};
