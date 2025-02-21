module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "24h",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
  roles: {
    ADMIN: "admin",
    CASHIER: "cashier",
    CHEF: "chef",
  },
};
